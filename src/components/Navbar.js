import React, {useState} from 'react';
import { Link } from 'react-router-dom';

const imprintHtml = process.env.REACT_APP_IMPRINT_HTML;
const privacyHtml = process.env.REACT_APP_PRIVACY_HTML;

const HtmlModal = ({ show, handleClose, htmlText }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
            <div className="bg-white p-4 rounded shadow-md w-1/3">
                <div dangerouslySetInnerHTML={{ __html: htmlText }} />
                <div className="mt-4 flex justify-end">
                    <button onClick={handleClose} className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded">Close</button>
                </div>
            </div>
        </div>
    );
};

const Navbar = () => {
  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [htmlText, setHtmlText] = useState('');

  const handleHtmlModalClose = () => {
    setShowHtmlModal(false);
  };

  const openModalWithHtml = (html) => {
    setHtmlText(html);
    setShowHtmlModal(true);
};

  return (
    <nav className="bg-gray-900 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">PrintCSS Playground</Link>
        <div>
          <Link to="/" className="text-white mr-4">Home</Link>
          <Link to="/editor" className="text-white">Editor</Link>
          {privacyHtml && (
            <Link to="#" className="text-white ml-4" onClick={() => openModalWithHtml(privacyHtml)}>Privacy Policy</Link>
          )}
          {imprintHtml && (
            <Link to="#" className="text-white ml-4" onClick={() => openModalWithHtml(imprintHtml)}>Imprint</Link>
          )}
        </div>
      </div>
      {/* HtmlModal */}
      <HtmlModal show={showHtmlModal} handleClose={handleHtmlModalClose} htmlText={htmlText} />
    </nav>
  );
};

export default Navbar;