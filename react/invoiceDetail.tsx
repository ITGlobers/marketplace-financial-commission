import type { FC } from 'react'
import React, { useEffect, useState } from 'react'
import { Layout, Spinner } from 'vtex.styleguide'
import Handlebars from 'handlebars'

import { getTemplate } from './services'

const InvoiceDetail: FC = () => {
  const [template, setTemplate] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const response = await getTemplate()

      if (!response) {
        return
      }

      setTemplate(response.template.Templates.email.Message)
    }

    fetchData()
  }, [template])

  if (!template) {
    return <Spinner />
  }

  const DATA = {
    id: 'sellerA_3918239129',
    status: 'paid',
    invoiceCreateDate: '25/02/2022',
    invoiceDueDate: '15/03/2022',
    sellerData: {
      name: 'Seller A',
      id: 'SellerId',
      contact: {
        phone: '+34874958678',
        fax: null,
        email: 'sesarocampo@sellera.com',
      },
      address: {
        postalCode: 'EC1Y 8TZ',
        city: 'Random',
        state: 'State of Liberty',
        country: 'GBR',
        street: 'Carrer de Sardenya',
        number: null,
      },
      comment: null,
    },
    orders: [
      {
        orderId: '10012931-12',
        total: 1200.0,
        commission: 400.0,
        totalOrderRate: 0.3,
      },
      {
        orderId: '11212924-14',
        total: 500.0,
        commission: 100.0,
        totalOrderRate: 0.2,
      },
      {
        orderId: '13312931-13',
        total: 1500.0,
        commission: 1000.0,
        totalOrderRate: 0.6,
      },
    ],
    totalizers: {
      subtotal: 1500,
      tax: {
        type: 'percentage',
        value: 10,
      },
      fee: 150,
      total: 1800,
    },
  }

  const hbTemplate = Handlebars.compile(template)
  const htmlString = hbTemplate(DATA)

  return (
    <Layout>
      <div dangerouslySetInnerHTML={{ __html: htmlString }} />
    </Layout>
  )
}

export default InvoiceDetail
