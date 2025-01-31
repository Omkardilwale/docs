import React, { useState ,useEffect} from 'react';
import '../styling/searchWithSuggestions.css'; 
import { display, style } from '@mui/system';
import { MdClear } from "react-icons/md";
import { sendEvent } from '@/utils/api';
import { commonEventAttributes } from '@/utils/utils';

const SearchWithSuggestions = ({ documents, onUpdateRelatedDocuments, policyNumber }) => { 
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const[UserId,setUserId] = useState(sessionStorage.getItem('userId'))


  useEffect(()=>{
    // console.log(documents)
  })

  const filterDocuments = (query) => {
    if (query === '') {
      setFilteredSuggestions([]);
      onUpdateRelatedDocuments([]); 
    } else {
      const filtered = documents.filter(doc =>
        doc.metaData.docType.toLowerCase().includes(query.toLowerCase()));
      
      const uniqueFiltered = [
        ...new Map(filtered.map(doc => [doc.metaData.docType, doc])).values()
      ];

      setFilteredSuggestions(uniqueFiltered);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    filterDocuments(value);

    if (value === '') {
      setSelectedSuggestions([]);
      onUpdateRelatedDocuments([]); 
    }
  };

  const handleSuggestionClick = async (docType) => {
    if (!selectedSuggestions.includes(docType)) {
      setSelectedSuggestions(prevState => [...prevState, docType]);
      const relatedDocs = documents.filter(doc => docType === doc.metaData.docType);
      onUpdateRelatedDocuments(relatedDocs); 
    }
    sendEvent({
      name: "filter_documents",
      attributes: {
        userId:UserId,
        ...commonEventAttributes(),
        docType: docType,
        policyNumber: policyNumber,
      }
    })
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && filteredSuggestions.length > 0) {
      const selectedDocTypes = filteredSuggestions.map(doc => doc.metaData.docType);
      setSelectedSuggestions(selectedDocTypes);
      const relatedDocs = documents.filter(doc => selectedDocTypes.includes(doc.metaData.docType));
      onUpdateRelatedDocuments(relatedDocs);
    }
  };

  const clearSearch =() => {
    setFilteredSuggestions([])
    setSelectedSuggestions([])
    setSearchQuery("")
    onUpdateRelatedDocuments(documents)

  }

  const renderSuggestions = () => {
    // if (filteredSuggestions.length === 0 && documents.length===0) {
    //   return <div className="no-suggestions">No suggestions available</div>;
    // }
    return (
      <>
        {filteredSuggestions.length >= 1 &&
          <ul className="suggestions-list">
            {filteredSuggestions.map((doc, index) => (
              <li
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(doc.metaData.docType)}
              >
                {doc.metaData.docType}
              </li>
            ))}
          </ul>
        }
      </>
    );
  };



  return (
    <div >
      <input
        type="text"
        placeholder="Search for documents"
        value={searchQuery}
        onChange={handleSearchInputChange}
        onKeyPress={handleKeyPress} 
        className="search-input"
      />
      {
        searchQuery.length!=0 && <button className='clear-btn' onClick={()=>{clearSearch()}}><MdClear/></button>
      }
      {renderSuggestions()}
    </div>
  );
};

export default SearchWithSuggestions;
