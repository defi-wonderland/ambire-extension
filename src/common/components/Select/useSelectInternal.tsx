import { useCallback, useMemo, useState } from 'react'

import usePrevious from '@common/hooks/usePrevious'
import useSelect from '@common/hooks/useSelect'

import { DEFAULT_SELECT_SIZE, SELECT_SIZE_TO_HEIGHT } from './styles'
import { SectionedSelectProps, SelectProps, SelectValue } from './types'
import useSelectKeyboardControl from './useSelectKeyboardControl'

type Props = Pick<
  SelectProps,
  'menuOptionHeight' | 'setValue' | 'size' | 'attemptToFetchMoreOptions' | 'mode' | 'menuPosition'
> & {
  value: SelectProps['value']
  data: SectionedSelectProps['sections']
  stickySectionHeadersEnabled?: boolean
  headerHeight?: number
}

const useSelectInternal = ({
  menuOptionHeight,
  setValue,
  value,
  size = DEFAULT_SELECT_SIZE,
  data,
  stickySectionHeadersEnabled,
  headerHeight = 0,
  attemptToFetchMoreOptions,
  mode = 'select',
  menuPosition
}: Props) => {
  const useSelectReturnValue = useSelect({ menuPosition })
  const { search, isMenuOpen, setIsMenuOpen, setSearch } = useSelectReturnValue
  const optionHeight = menuOptionHeight || SELECT_SIZE_TO_HEIGHT[size]

  const [listHeight, setListHeight] = useState(0)

  const handleOptionSelect = useCallback(
    (item: SelectValue) => {
      !!setValue && setValue(item)
      setIsMenuOpen(false)
      setSearch('search', '')
    },
    [setValue, setIsMenuOpen, setSearch]
  )

  const prevSearch = usePrevious(search)

  const filteredData = useMemo(() => {
    if (!search) return data

    const normalizedSearchTerm = search.toLowerCase()

    const filterOptions = (options: SelectProps['options']) => {
      const { exactMatches, partialMatches } = options.reduce(
        (result, o) => {
          const { value: optionValue, label, extraSearchProps } = o

          const fieldsToBeSearchedInto = [
            optionValue.toString().toLowerCase(),
            // In case the label is string, include it (could be any ReactNode)
            typeof label === 'string' ? label.toLowerCase() : '',
            ...(extraSearchProps
              ? Object.values(extraSearchProps).map((field: unknown) => String(field).toLowerCase())
              : [])
          ]

          // Prioritize exact matches, partial matches come after
          const isExactMatch = fieldsToBeSearchedInto.some((f) => f === normalizedSearchTerm)
          const isPartialMatch = fieldsToBeSearchedInto.some((f) =>
            f.includes(normalizedSearchTerm)
          )
          if (isExactMatch) {
            result.exactMatches.push(o)
          } else if (isPartialMatch) {
            result.partialMatches.push(o)
          }

          return result
        },
        { exactMatches: [] as SelectValue[], partialMatches: [] as SelectValue[] }
      )

      return { exactMatches, partialMatches }
    }

    const sectionsWithFilteredData = data.map((section) => {
      const { exactMatches, partialMatches } = filterOptions(section.data as SelectProps['options'])

      return {
        ...section,
        data: [...exactMatches, ...partialMatches]
      }
    })
    const noMatchesFound = sectionsWithFilteredData.every((section) => section.data.length === 0)
    const isAnotherSearchTerm = search !== prevSearch
    const shouldAttemptToFetchMoreOptions =
      noMatchesFound && isAnotherSearchTerm && !!attemptToFetchMoreOptions
    if (shouldAttemptToFetchMoreOptions) attemptToFetchMoreOptions(search)

    return noMatchesFound ? [] : sectionsWithFilteredData
  }, [data, search, attemptToFetchMoreOptions, prevSearch])

  const keyExtractor = useCallback((item: SelectValue) => item.key || item.value, [])

  const getItemLayout = useCallback(
    (d: SelectValue[] | null | undefined, index: number) => {
      return {
        length: optionHeight,
        offset: optionHeight * index,
        index
      }
    },
    [optionHeight]
  )

  const handleLayout = useCallback((event: any) => {
    const { height } = event.nativeEvent.layout
    setListHeight(height)
  }, [])

  const { listRef, renderItem, handleScroll } = useSelectKeyboardControl({
    listHeight,
    optionHeight,
    headerHeight,
    sections: filteredData,
    value,
    size,
    isMenuOpen,
    stickySectionHeadersEnabled,
    setIsMenuOpen,
    handleOptionSelect,
    mode
  })

  return {
    ...useSelectReturnValue,
    filteredData,
    listRef,
    renderItem,
    keyExtractor,
    getItemLayout,
    handleScroll,
    handleLayout
  }
}

export default useSelectInternal
