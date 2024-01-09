interface SchedulerRequest {
  id: string
  request: {
    uri: string
    method: string
    headers: { [k: string]: unknown }
  }
  scheduler: {
    expression: string
    endDate: string
  }
}
