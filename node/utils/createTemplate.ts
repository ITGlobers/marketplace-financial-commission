import { Clients } from '../clients'
import GetBody from '../templates'

export const createTemplate = async (clients: Clients): Promise<any> => {
  const  { template } = clients

  const templateResponse = await template.getTemplate()
  if (templateResponse) {
    return { template: templateResponse }
  } else {
    const templateBody = await GetBody(clients)
    const templateCreated = await template.publishTemplate(templateBody)
    return{ template: templateCreated }
  }

}
