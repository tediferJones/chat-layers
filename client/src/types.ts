interface FormattedMessage {
  username: string,
  message: string,
  color: string,
}

interface Servers {
  [key: string]: FormattedMessage[]
}

interface FormInputs {
  [key: string]: string,
}

export type {
  Servers,
  FormInputs,
  FormattedMessage,
}
