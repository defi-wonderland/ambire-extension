export const resolveInteropAddress = async (trimmedAddress: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(trimmedAddress)
    }, 100)
  })
  // return isValid ? trimmedAddress : ''
}
