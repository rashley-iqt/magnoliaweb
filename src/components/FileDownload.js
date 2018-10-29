import React from "react";
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

function FileDownload({ className, selected, url, disabled }) {
  return (
    <span className={ className }>
      <a className="button" href={ url } download={ selected + ".json" }
        title="Download" disabled={disabled} >
        <FontAwesomeIcon icon={faDownload} />
      </a>
    </span>
  );
}

FileDownload.propTypes = {
  className: PropTypes.string,
  selected: PropTypes.string,
  url: PropTypes.string
};

export default FileDownload;