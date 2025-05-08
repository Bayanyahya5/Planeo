import Layout from "./Layout.jsx";

import Home from "./Home";

import Preferences from "./Preferences";

import Results from "./Results";

import Budget from "./Budget";

import DescriptionInput from "./DescriptionInput";

import CountryComparison from "./CountryComparison";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Preferences: Preferences,
    
    Results: Results,
    
    Budget: Budget,
    
    DescriptionInput: DescriptionInput,
    
    CountryComparison: CountryComparison,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Preferences" element={<Preferences />} />
                
                <Route path="/Results" element={<Results />} />
                
                <Route path="/Budget" element={<Budget />} />
                
                <Route path="/DescriptionInput" element={<DescriptionInput />} />
                
                <Route path="/CountryComparison" element={<CountryComparison />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}