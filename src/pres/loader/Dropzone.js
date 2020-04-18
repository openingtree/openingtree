import React from 'react'
import {DropzoneArea} from 'material-ui-dropzone'

export default class Dropzone extends React.Component{
    render(){
      return (
        <DropzoneArea 
        acceptedFiles={[]}
        dropzoneText="Drag and drop up to 10 pgn files here or click to select"
          onChange={this.props.filesChange}
          dropzoneParagraphClass="dropzonetext"
          showFileNames={true}
          useChipsForPreview={true}
          previewChipProps={{className:"previewChip"}}
          dropzoneClass="dropzone"
          filesLimit="10"
          />
      )  
    }
  } 