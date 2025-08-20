import React from 'react';
import Carousel from '../components/carousel';
import CicleMenu from '../components/cicle_menu';
import Header from '../components/header';
import Footer from '../components/Footer';
const MainPage = () => {
    return [<Header/>,<div id='main'><Carousel/><CicleMenu/></div>, <Footer/>];
}

export default MainPage;
