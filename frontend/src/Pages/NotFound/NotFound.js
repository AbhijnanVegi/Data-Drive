
import React from 'react';
import SadFace from '../../public/404SadFace.png'

const NotFound = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <img src={SadFace} alt="Sad Face" style={{ width: 'auto', height: '30%' }} />
            <h1>404 Not Found</h1>
            <p>Either the Resource does not exist, or you do not have the approprate permissions to access it</p>
        </div>
    );
};

export default NotFound;
