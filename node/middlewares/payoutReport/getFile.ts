export async function getPayoutReportFile(
  ctx: Context,
  next: () => Promise<any>
) {
  ctx.status = 404

  await next()
}
