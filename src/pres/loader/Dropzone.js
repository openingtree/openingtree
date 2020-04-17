import React from 'react'
import {DropzoneArea} from 'material-ui-dropzone'

export default class FileUpload extends React.Component{
    constructor(props){
      super(props);
      this.state = {
        files: []
      };
    }
    handleChange(files){
      this.setState({
        files: files
      });
    }
    render(){
      return (
        <DropzoneArea 
        acceptedFiles={[]}
        dropzoneText="Drag and drop up to 10 pgn files here or click to select"
          onChange={this.handleChange.bind(this)}
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