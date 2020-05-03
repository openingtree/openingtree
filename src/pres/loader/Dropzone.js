import React from 'react'
import {DropzoneArea} from 'material-ui-dropzone'
import { trackEvent } from '../../app/Analytics'
import * as Constants from '../../app/Constants'

export default class Dropzone extends React.Component{
    handleFileChange(newFiles) {
      trackEvent(Constants.EVENT_CATEGORY_PGN_LOADER, "FileSaved", newFiles.length>0?newFiles[0].name:null)
      this.props.filesChange(newFiles)
    }
    render(){
      return (
        <DropzoneArea 
        acceptedFiles={[]}
        dropzoneText={this.props.dropzoneText}
          onChange={this.handleFileChange.bind(this)}
          dropzoneParagraphClass="dropzonetext"
          showFileNames={true}
          useChipsForPreview={true}
          previewChipProps={{className:"previewChip"}}
          dropzoneClass="dropzone"
          filesLimit={this.props.filesLimit}
          maxFileSize={3000000000000}
          />
      )  
    }
  } 