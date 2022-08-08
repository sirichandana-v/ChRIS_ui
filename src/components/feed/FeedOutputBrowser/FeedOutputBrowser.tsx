import React from 'react'
import { useTypedSelector } from '../../../store/hooks'
import { useDispatch } from 'react-redux'
import JSZip from 'jszip'

import {
  Grid,
  GridItem,
  Skeleton,
  EmptyState,
  Title,
  EmptyStateBody,
  EmptyStateVariant,
} from '@patternfly/react-core'

import { Spin, Alert, Tree } from 'antd'
import PluginViewerModal from '../../detailedView/PluginViewerModal'
import {
  destroyExplorer,
  setExplorerMode,
  setExplorerRequest,
} from '../../../store/explorer/actions'
import { getPluginFilesRequest } from '../../../store/resources/actions'
import FileViewerModel from '../../../api/models/file-viewer.model'
import { createTreeFromFiles, getPluginName } from './utils'
import { PluginInstance } from '@fnndsc/chrisapi'
import { isEmpty } from 'lodash'
import { getFeedTree } from './data'
import { DataNode, ExplorerMode } from '../../../store/explorer/types'
import { useSafeDispatch } from '../../../utils'
import './FeedOutputBrowser.scss'

const FileBrowser = React.lazy(() => import('./FileBrowser'))
const { DirectoryTree } = Tree

export interface FeedOutputBrowserProps {
  handlePluginSelect: (node: PluginInstance) => void
  expandDrawer: (panel: string) => void
}



const FeedOutputBrowser: React.FC<FeedOutputBrowserProps> = ({
  handlePluginSelect,
  expandDrawer,
}) => {
  const dispatch = useDispatch()
  const pluginInstances = useTypedSelector(
    (state) => state.instance.pluginInstances,
  )
  const pluginFiles = useTypedSelector((state) => state.resource.pluginFiles)
  const selected = useTypedSelector((state) => state.instance.selectedPlugin)
  const { data: plugins, loading } = pluginInstances

  const pluginFilesPayload = selected && pluginFiles[selected.data.id]

  React.useEffect(() => {
    if (selected) {
      dispatch(getPluginFilesRequest(selected))
    }
  }, [selected])

  return (
    <Grid hasGutter className="feed-output-browser ">
      <GridItem
        className="feed-output-browser__sidebar"
        xl={2}
        xlRowSpan={12}
        xl2={2}
        xl2RowSpan={12}
        lg={2}
        lgRowSpan={12}
        md={2}
        mdRowSpan={12}
        sm={12}
        smRowSpan={12}
      >
        {plugins && selected && (
          <SidebarTree
            plugins={plugins}
            selected={selected}
            handlePluginSelect={handlePluginSelect}
          />
        )}
      </GridItem>
      <GridItem
        className="feed-output-browser__main"
        xl={10}
        xlRowSpan={12}
        xl2={10}
        xl2RowSpan={12}
        lg={10}
        lgRowSpan={12}
        md={10}
        mdRowSpan={12}
        sm={12}
        smRowSpan={12}
      >
        <React.Suspense
          fallback={
            <div>
              <Skeleton
                height="100%"
                width="100%"
                screenreaderText="Fetching the File Browser"
              />
            </div>
          }
        >
          {pluginFilesPayload && (
            <FileBrowser pluginFilesPayload={pluginFilesPayload} />
          )}
        </React.Suspense>
      </GridItem>
    </Grid>
  )
}

export default FeedOutputBrowser

/*
const FeedOutputBrowser: React.FC<FeedOutputBrowserProps> = ({
  handlePluginSelect,
  expandDrawer,
}) => {
  const [pluginModalOpen, setPluginModalOpen] = React.useState(false)
  const dispatch = useDispatch()
  const safeDispatch = useSafeDispatch(dispatch)
  const selected = useTypedSelector((state) => state.instance.selectedPlugin)
  const pluginFiles = useTypedSelector((state) => state.resource.pluginFiles)
  const pluginInstances = useTypedSelector(
    (state) => state.instance.pluginInstances,
  )
  const [download, setDownload] = React.useState({
    count: 0,
    status: false,
  })

  const { data: plugins, loading } = pluginInstances

  const pluginFilesPayload = selected && pluginFiles[selected.data.id]

  React.useEffect(() => {
    if (!pluginFilesPayload && selected) {
      safeDispatch(getPluginFilesRequest(selected))
    }
  }, [selected, pluginFilesPayload, safeDispatch])

  if (!selected || isEmpty(pluginInstances) || loading) {
    return <LoadingFeedBrowser />
  } else {
    const pluginName = getPluginName(selected)
    const pluginFiles = pluginFilesPayload && pluginFilesPayload.files
    const tree: DataNode[] | null = createTreeFromFiles(selected, pluginFiles)
    const downloadAllClick = async () => {
      const zip = new JSZip()
      let count = 0
      if (pluginFiles) {
        const length = pluginFiles.length
        for (const file of pluginFiles) {
          count += 1
          const percentage = Number(((count / length) * 100).toFixed(2))
          setDownload({
            status: true,
            count: percentage,
          })
          const fileBlob = await file.getFileBlob()
          zip.file(file.data.fname, fileBlob)
        }
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      const filename = `${getPluginName(selected)}.zip`
      FileViewerModel.downloadFile(blob, filename)
      setDownload({
        ...download,
        status: false,
      })
    }

    const handleFileBrowserOpen = () => {
      if (tree) {
        dispatch(setExplorerRequest(tree))
      }
      setPluginModalOpen(!pluginModalOpen)
    }

    const handleDicomViewerOpen = () => {
      setPluginModalOpen(!pluginModalOpen)
      dispatch(setExplorerMode(ExplorerMode.DicomViewer))
    }

    const handleXtkViewerOpen = () => {
      setPluginModalOpen(!pluginModalOpen)
      dispatch(setExplorerMode(ExplorerMode.XtkViewer))
    }

    const handlePluginModalClose = () => {
      setPluginModalOpen(!pluginModalOpen)
      dispatch(destroyExplorer())
    }

    let pluginSidebarTree
    if (plugins && plugins.length > 0) {
      pluginSidebarTree = getFeedTree(plugins)
    }

    return (
      <>
        <Grid hasGutter className="feed-output-browser ">
          <GridItem
            className="feed-output-browser__sidebar"
            xl={2}
            xlRowSpan={12}
            xl2={2}
            xl2RowSpan={12}
            lg={2}
            lgRowSpan={12}
            md={2}
            mdRowSpan={12}
            sm={12}
            smRowSpan={12}
          >
            {pluginSidebarTree && (
              <DirectoryTree
                defaultExpandAll
                treeData={pluginSidebarTree}
                selectedKeys={[selected.data.id]}
                onSelect={(node, selectedNode) => {
                  //@ts-ignore
                  handlePluginSelect(selectedNode.node.item)
                }}
              />
            )}
          </GridItem>
          <GridItem
            className="feed-output-browser__main"
            xl={10}
            xlRowSpan={12}
            xl2={10}
            xl2RowSpan={12}
            lg={10}
            lgRowSpan={12}
            md={10}
            mdRowSpan={12}
            sm={12}
            smRowSpan={12}
          >
            {tree ? (
              <React.Suspense
                fallback={
                  <div>
                    <Skeleton
                      height="100%"
                      width="100%"
                      screenreaderText="Fetching the File Browser"
                    />
                  </div>
                }
              >
                <FileBrowser
                  selectedFiles={pluginFiles}
                  pluginName={pluginName}
                  root={tree[0]}
                  key={selected.data.id}
                  handleFileBrowserToggle={handleFileBrowserOpen}
                  handleDicomViewerOpen={handleDicomViewerOpen}
                  handleXtkViewerOpen={handleXtkViewerOpen}
                  downloadAllClick={downloadAllClick}
                  expandDrawer={expandDrawer}
                  download={download}
                />
              </React.Suspense>
            ) : (
              <EmptyStateLoader />
            )}
          </GridItem>
        </Grid>
        <PluginViewerModal
          isModalOpen={pluginModalOpen}
          handleModalToggle={handlePluginModalClose}
        />
      </>
    )
  }
}

export default React.memo(FeedOutputBrowser)

const LoadingFeedBrowser = () => {
  return (
    <Grid hasGutter className="feed-output-browser">
      <GridItem className="feed-output-browser__sidebar " rowSpan={12} span={2}>
        <Skeleton
          shape="square"
          width="30%"
          screenreaderText="Loading Sidebar"
        />
      </GridItem>
      <GridItem className="feed-output-browser__main" span={10} rowSpan={12}>
        <Grid>
          <GridItem span={12} rowSpan={12}>
            <Skeleton
              height="100%"
              width="75%"
              screenreaderText="Fetching Plugin Resources"
            />
          </GridItem>
        </Grid>
      </GridItem>
    </Grid>
  )
}

const EmptyStateLoader = () => {
  return (
    <EmptyState variant={EmptyStateVariant.large}>
      <Title headingLevel="h4" size="lg" />
      <EmptyStateBody>
        Files are not available yet and are being fetched. Please give it a
        moment...
      </EmptyStateBody>
    </EmptyState>
  )
}

const FetchFilesLoader = () => {
  return (
    <Spin tip="Processing....">
      <Alert message="Retrieving Plugin's Files" type="info" />
    </Spin>
  )
}
*/


const SidebarTree = (props: {
  plugins: PluginInstance[]
  selected: PluginInstance
  handlePluginSelect: (node: PluginInstance) => void
}) => {
  const { selected, plugins } = props
  const [tree, setTreeData] = React.useState<DataNode[]>()
  React.useEffect(() => {
    const pluginSidebarTree = getFeedTree(plugins)
    //@ts-ignore
    setTreeData(pluginSidebarTree)
  }, [plugins])

  return (
    <DirectoryTree
      defaultExpandAll
      treeData={tree}
      selectedKeys={[selected.data.id]}
      onSelect={(node, selectedNode) => {
        //@ts-ignore
        handlePluginSelect(selectedNode.node.item)
      }}
    />
  )
}