import type { ParamsContext } from '@vtex/api'
import { Service } from '@vtex/api'

import clients from './clients'
import type { Clients } from './clients'
import { queries, mutations } from './resolvers'
import { routes } from './routes'
import { onAppsInstalled } from './events/initialConfiguration'

export default new Service<Clients, AppState, ParamsContext>({
  clients,
  events: {
    onAppsInstalled,
  },
  routes,
  graphql: {
    resolvers: {
      Query: {
        ...queries,
      },
      Mutation: {
        ...mutations,
      },
    },
  },
})
