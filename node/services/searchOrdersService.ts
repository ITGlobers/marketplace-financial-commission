import { format, isToday, subDays } from 'date-fns'

import { orderDetailCommission } from '../middlewares/orders/orderDetailCommission'
import { orderListSeller } from '../middlewares/orders/orderListSeller'

export const searchOrdersService = async (
  searchOrdersParams: SearchOrdersServiceRequest,
  ctx: Context
) => {
  const { dateStart, dateEnd, sellerName, page, perpage } = searchOrdersParams

  const beforeToday = isToday(new Date(dateEnd))
    ? format(subDays(new Date(dateEnd), 1), 'yyyy-MM-dd')
    : dateEnd

  const status = searchOrdersParams.status as string

  const listOrders = await orderListSeller(
    ctx,
    sellerName,
    dateStart,
    beforeToday,
    page,
    perpage,
    status
  )

  const ordersDetailCommission = await orderDetailCommission(ctx, listOrders)

  const resultDetail: OrdersResponse = {
    data: ordersDetailCommission,
    paging: listOrders.paging,
  }

  return { status: 200, resultDetail }
}
