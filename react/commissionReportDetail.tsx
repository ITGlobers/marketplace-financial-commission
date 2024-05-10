import React from 'react'
import { useQuery } from 'react-apollo'
import { detail as Detail } from 'obi.components-financial-commission'

import GET_SELLERS from './graphql/getSellers.gql'
import GET_SETTINGS from './graphql/getSettings.gql'
import SEARCH_ORDERS from './graphql/getSearchOrders.gql'
import CREATE_INVOICE from './graphql/createInvoice.gql'
import SELLER_INVOICES from './graphql/getInvoicesBySeller.gql'
import GET_PAYOUT_REPORTS from './graphql/getPayoutReports.gql'

function CommissionDetail() {
  const { data: dataSellers, loading } = useQuery(GET_SELLERS, {
    ssr: false,
    pollInterval: 0,
  })

  if (loading) {
    return null
  }

  return (
    <Detail
      dataSellers={dataSellers}
      ordersQuery={SEARCH_ORDERS}
      invoiceMutation={CREATE_INVOICE}
      invoicesQuery={SELLER_INVOICES}
      settingsQuery={GET_SETTINGS}
      payoutReportsQuery={GET_PAYOUT_REPORTS}
    />
  )
}

export default CommissionDetail
