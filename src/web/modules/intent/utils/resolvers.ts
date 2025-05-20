import { resolveENSDomain } from '@ambire-common/services/ensDomains'
import { ToastOptions } from '@common/contexts/toastContext'
import { resolveInteropAddress } from './resolveInteropAddress'

// Possible resfactor for resolvers logic
export interface Resolver {
  name: string
  canResolve: (address: string) => boolean
  resolve: (address: string) => Promise<string>
}

export interface ResolverContext {
  fieldValue: string
  handleCacheResolvedDomain: (address: string, domain: string, type: 'ens') => void
  addToast: (message: string, options?: ToastOptions) => void
  setAddressState: (state: {
    ensAddress?: string
    interopAddress?: string
    isDomainResolving?: boolean
  }) => void
}

export const createResolvers = (context: ResolverContext): Resolver[] => [
  {
    name: 'interop',
    canResolve: (address: string) => {
      // Match <prefix>@<namespace>[:<chainId>]#<checksum>
      const pattern = /^[^@]+@[^:#]+(?::[^#]+)?#[^#]+$/
      return pattern.test(address)
    },
    resolve: async (address: string) => {
      try {
        const resolvedAddress = await resolveInteropAddress(address)
        console.log('Front: Resolved interop address:', resolvedAddress)

        if (resolvedAddress) {
          context.setAddressState({ interopAddress: resolvedAddress })
          return resolvedAddress
        }

        return ''
      } catch (error) {
        context.setAddressState({ interopAddress: '' })
        context.addToast('Something went wrong while attempting to resolve the interop address.', {
          type: 'error'
        })
        return ''
      }
    }
  },
  {
    name: 'ens',
    canResolve: (address: string) => address.toLowerCase().endsWith('.eth'),
    resolve: async (address: string) => {
      try {
        const resolvedAddress = await resolveENSDomain(address)

        if (resolvedAddress) {
          context.handleCacheResolvedDomain(resolvedAddress, context.fieldValue, 'ens')
          context.setAddressState({ ensAddress: resolvedAddress })
          return resolvedAddress
        }

        return ''
      } catch (error) {
        context.setAddressState({ ensAddress: '' })
        context.addToast('Something went wrong while attempting to resolve the ENS domain.', {
          type: 'error'
        })
        return ''
      }
    }
  }
]

export const resolveDomains = async (address: string, context: ResolverContext): Promise<void> => {
  const resolvers = createResolvers(context)
  const applicableResolvers = resolvers.filter((r) => r.canResolve(address))

  console.log('Front: resolvers', applicableResolvers)

  // If no resolvers apply, reset state
  if (applicableResolvers.length === 0) {
    context.setAddressState({
      ensAddress: '',
      interopAddress: '',
      isDomainResolving: false
    })
    return
  }

  try {
    await Promise.all(applicableResolvers.map((resolver) => resolver.resolve(address)))
  } catch (error) {
    context.addToast('Something went wrong while resolving domain.', { type: 'error' })
  } finally {
    if (context.fieldValue.trim() === address.trim()) {
      context.setAddressState({
        isDomainResolving: false
      })
    }
  }
}
