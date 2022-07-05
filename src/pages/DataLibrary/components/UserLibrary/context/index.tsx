import React, { createContext, useReducer } from 'react'

export interface Paginated {
  hasNext: boolean
  limit: number
  offset: number
  totalCount: number
}

export interface FileSelect {
  exactPath: string
  path: string
  folder: string
  type: string
  event?: string
}

interface LibraryState {
  initialPath: {
    [key: string]: string
  }
  homePath: {
    [key: string]: {
      path: string
      home: boolean
    }
  }
  filesState: {
    [key: string]: any[]
  }
  foldersState: {
    [key: string]: { path: string; name: string }[]
  }
  folderDetails: {
    currentFolder: string
    totalCount: number
  }
  paginated: {
    [key: string]: Paginated
  }
  previewAll: boolean
  loading: boolean
  paginatedFolders: {
    [key: string]: string[]
  }

  selectedFolder: FileSelect[]
  tooltip: boolean
  currentPath: string
}

function getInitialState(): LibraryState {
  return {
    initialPath: {},
    homePath: {},
    filesState: {},
    foldersState: {},
    folderDetails: {
      currentFolder: '',
      totalCount: 0,
    },
    paginated: {},
    previewAll: false,
    loading: false,
    paginatedFolders: {},
    selectedFolder: [],
    tooltip: false,
    currentPath: '',
  }
}

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key
      }
    : {
        type: Key
        payload: M[Key]
      }
}

export enum Types {
  SET_FILES = 'SET_FILES',
  SET_FOLDERS = 'SET_FOLDERS',
  SET_PAGINATED_FOLDERS = 'SET_PAGINATED_FOLDERS',
  SET_INITIAL_PATH = 'SET_INITIAL_PATH',
  SET_HOME_PATH = 'SET_HOME_PATH',
  SET_PAGINATION = 'SET_PAGINATION',
  SET_LOADING = 'SET_LOADING',
  SET_FOLDER_DETAILS = 'SET_FOLDER_DETAILS',
  SET_PREVIEW_ALL = 'SET_PREVIEW_ALL',
  SET_ADD_FOLDER = 'SET_ADD_FOLDER',
  SET_SELECTED_FOLDER = 'SET_SELECTED_FOLDER',
  SET_CLEAR_FILE_SELECT = 'SET_CLEAR_FILE_SELECT',
  CLEAR_FOLDER_STATE = 'CLEAR_FOLDER_STATE',
  CLEAR_SELECTED_FOLDER = 'CLEAR_SELECTED_FOLDER',
  CLEAR_FILES_STATE = 'CLEAR_FILES_STATE',
  SET_TOOLTIP = 'SET_TOOLTIP',
  SET_CURRENT_PATH = 'SET_CURRENT_PATH',
}

type LibraryPayload = {
  [Types.SET_FILES]: {
    files: any[]
    path: string
  }
  [Types.SET_FOLDERS]: {
    folders: { path: string; name: string }[]
    path: string
  }

  [Types.SET_INITIAL_PATH]: {
    path: string
    type: string
  }

  [Types.SET_HOME_PATH]: {
    path: string
    type: string
  }

  [Types.SET_PAGINATION]: {
    path: string
    hasNext: boolean
    limit: number
    offset: number
    totalCount: number
  }
  [Types.SET_PAGINATED_FOLDERS]: {
    folders: string[]
    path: string
  }
  [Types.SET_LOADING]: {
    loading: false
  }
  [Types.SET_FOLDER_DETAILS]: {
    currentFolder: string
    totalCount: number
  }
  [Types.SET_PREVIEW_ALL]: {
    previewAll: boolean
  }

  [Types.SET_ADD_FOLDER]: {
    folder: string
    username: string | null | undefined
  }

  [Types.SET_CLEAR_FILE_SELECT]: {
    clear: boolean
  }

  [Types.SET_SELECTED_FOLDER]: {
    selectFolder: FileSelect
  }

  [Types.CLEAR_SELECTED_FOLDER]: {
    selectFolder: FileSelect
  }

  [Types.CLEAR_FOLDER_STATE]: {
    path: string
    type: string
  }

  [Types.CLEAR_FILES_STATE]: {
    path: string
  }
  [Types.SET_TOOLTIP]: {
    tooltip: boolean
  }

  [Types.SET_CURRENT_PATH]: {
    path: string
  }
}

export type LibraryActions = ActionMap<LibraryPayload>[keyof ActionMap<
  LibraryPayload
>]

const LibraryContext = createContext<{
  state: LibraryState
  dispatch: React.Dispatch<any>
}>({
  state: getInitialState(),
  dispatch: () => null,
})

export const libraryReducer = (
  state: LibraryState,
  action: LibraryActions,
): LibraryState => {
  switch (action.type) {
    case Types.SET_FOLDERS: {
      return {
        ...state,
        foldersState: {
          [action.payload.path]: action.payload.folders,
        },
      }
    }

    case Types.SET_CURRENT_PATH: {
      console.log("ACTION", action.payload.path)
      return {
        ...state,
        currentPath: action.payload.path,
      }
    }

    case Types.SET_FILES: {
      if (action.payload.files.length == 0) {
        return {
          ...state,
          filesState: {},
        }
      } else {
        return {
          ...state,
          filesState: {
            ...state.filesState,
            [action.payload.path]: action.payload.files,
          },
        }
      }
    }

    /*
    case Types.SET_INITIAL_PATH: {
      return {
        ...state,
        initialPath: {
          ...state.initialPath,
          [action.payload.type]: action.payload.path,
        },
        homePath: {
          ...state.homePath,
          [action.payload.type]: {
            ...state.homePath[action.payload.type],
            home: false,
          },
        },
      }
    }

    case Types.SET_HOME_PATH: {
      return {
        ...state,
        homePath: {
          ...state.homePath,
          [action.payload.type]: {
            path: action.payload.path,
            home: true,
          },
        },
      }
    }

    case Types.CLEAR_FILES_STATE: {
      const copy = { ...state.filesState }
      const copyPaginated = { ...state.paginated }

      const path = action.payload.path
      if (path) {
        delete copy[path]
        delete copyPaginated[path]
        return {
          ...state,
          filesState: copy,
          paginated: copyPaginated,
        }
      } else
        return {
          ...state,
        }
    }

    case Types.CLEAR_FOLDER_STATE: {
      const copy = { ...state.foldersState }
      const copyPaginatedFolders = { ...state.paginatedFolders }
      const copyPaginated = { ...state.paginated }

      const path = action.payload.path
      if (path) {
        delete copy[path]
        delete copyPaginatedFolders[path]
        delete copyPaginated[path]

        return {
          ...state,
          foldersState: copy,
          paginatedFolders: copyPaginatedFolders,
          paginated: copyPaginated,
        }
      } else
        return {
          ...state,
        }
    }

   

    case Types.SET_CLEAR_FILE_SELECT: {
      return {
        ...state,
        selectedFolder: [],
      }
    }
    case Types.SET_SELECTED_FOLDER: {
      const { folder, exactPath, path, type } = action.payload.selectFolder
      const folderPayload = {
        exactPath,
        path,
        type,
        folder,
      }
      return {
        ...state,
        selectedFolder: [...state.selectedFolder, folderPayload],
      }
    }

    case Types.CLEAR_SELECTED_FOLDER: {
      const newFileSelect = state.selectedFolder.filter(
        (file) => file.exactPath !== action.payload.selectFolder.exactPath,
      )
      return {
        ...state,
        selectedFolder: newFileSelect,
      }
    }

    /

    case Types.SET_PAGINATION: {
      const { path, hasNext, limit, offset, totalCount } = action.payload

      return {
        ...state,
        paginated: {
          ...state.paginated,
          [path]: {
            hasNext,
            limit,
            offset,
            totalCount,
          },
        },
      }
    }

    case Types.SET_LOADING: {
      return {
        ...state,
        loading: action.payload.loading,
      }
    }

    case Types.SET_FILES: {
      if (action.payload.files.length == 0) {
        return {
          ...state,
          filesState: {},
        }
      } else {
        return {
          ...state,
          filesState: {
            ...state.filesState,
            [action.payload.type]: action.payload.files,
          },
        }
      }
    }

    case Types.SET_FOLDERS: {
      return {
        ...state,
        foldersState: {
          ...state.foldersState,
          [action.payload.type]: action.payload.folders,
        },
      }
    }

    case Types.SET_PAGINATED_FOLDERS: {
      return {
        ...state,
        paginatedFolders: {
          ...state.paginatedFolders,
          [action.payload.path]: action.payload.folders,
        },
      }
    }

    case Types.SET_FOLDER_DETAILS: {
      return {
        ...state,
        folderDetails: {
          currentFolder: action.payload.currentFolder,
          totalCount: action.payload.totalCount,
        },
      }
    }

    case Types.SET_PREVIEW_ALL: {
      return {
        ...state,
        previewAll: action.payload.previewAll,
      }
    }

    case Types.SET_ADD_FOLDER: {
      const path = `${action.payload.username}/uploads`

      if (state.foldersState[path]) {
        return {
          ...state,
          foldersState: {
            ...state.foldersState,
            [path]: [action.payload.folder, ...state.foldersState[path]],
          },
        }
      } else {
        return {
          ...state,
          foldersState: {
            ...state.foldersState,
            [path]: [action.payload.folder],
          },
        }
      }
    }

    case Types.SET_TOOLTIP: {
      return {
        ...state,
        tooltip: action.payload.tooltip,
      }
    }
    */

    default:
      return state
  }
}

interface LibraryProviderProps {
  children: React.ReactNode
}

const LibraryProvider: React.FC<LibraryProviderProps> = ({ children }) => {
  const initialState = getInitialState()
  const [state, dispatch] = useReducer(libraryReducer, initialState)
  return (
    <LibraryContext.Provider value={{ state, dispatch }}>
      {children}
    </LibraryContext.Provider>
  )
}

export { LibraryContext, LibraryProvider }
