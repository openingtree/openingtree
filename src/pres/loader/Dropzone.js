import React from 'react'
import {DropzoneArea} from 'material-ui-dropzone'

export default class Dropzone extends React.Component{
    render(){
      return (
        <DropzoneArea 
        acceptedFiles={[]}
        dropzoneText={this.props.dropzoneText}
          onChange={this.props.filesChange}
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