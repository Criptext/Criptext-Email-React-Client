import React from 'react';
import PanelWrapper from './components/PanelWrapper';
import CustomTitleBar from './components/CustomTitleBar';
import './app.scss';

function App() {
  return (
    <div className="wrapper-out">
      <CustomTitleBar />
      <PanelWrapper />
    </div>
  );
}

export default App;
