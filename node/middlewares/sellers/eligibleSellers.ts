import { config } from '../../constants'
import { CustomError } from '../../utils/customError'

/**
 * @middleware
 * Filter sellers that are eligible for Invoice creation.
 * Intended to be automatically run by a scheduler in a Marketplace.
 */
export async function eligibleSellers(
  ctx: Context,
  next: () => Promise<Sellers>,
  retrySellers?: ItemSeller[]
) {
  /**
   * @todo
   * Es un retry así util?
   *
   * Se saltea comprobaciones y va directo a reintentar
   * los sellers que devuelve el scheduler
   */
  if (retrySellers) {
    ctx.state.body = { sellers: retrySellers }

    await next()
  }

  const {
    clients: { sellersIO, vbase },
    vtex: { account: marketplace },
  } = ctx

  const [today] = new Date().toISOString().split('T')

  const DEFAULT_SETTINGS = await vbase.getJSON<Settings>(
    config.SETTINGS_BUCKET,
    marketplace,
    true
  )

  if (!DEFAULT_SETTINGS) {
    throw new CustomError({
      message:
        "No default Marketplace's settings found, please configure them in the Admin panel",
      status: 500,
    })
  }

  const allSellers = await sellersIO.getSellers()

  const activeSellers = allSellers.items.filter(({ isActive }) => isActive)

  if (!activeSellers) {
    /**
     * @todo
     * Esto lo manejamos como un error? O solo retornamos un warning?
     */
    throw new CustomError({
      message: "There're no active sellers for this Marketplace",
      status: 204,
    })
  }

  const sellersToInvoice = await Promise.all(
    activeSellers.map(async (seller) => {
      const sellerSettings =
        (await vbase.getJSON<SellerSettings>(
          config.SETTINGS_BUCKET,
          seller.name,
          true
        )) || DEFAULT_SETTINGS

      /**
       * @todo
       * Revisar que manejemos las fechas de una manera exacta.
       * Desde los settings, los calculos y hasta los clientes.
       */
      if (sellerSettings.nextCycle <= today) {
        return { ...seller, ...sellerSettings }
      }

      return null
    })
  )

  // Filter sellers that fall outside this cycle
  const sellers = sellersToInvoice.filter(Boolean) as SellerInvoice[]

  ctx.state.body = { sellers, today }

  await next()
}
