import React from 'react';
import { setChonkyDefaults } from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';
import { FullFileBrowser } from 'chonky';
import '../css/HomePage.css'

setChonkyDefaults({ iconComponent: ChonkyIconFA });

const HomePage = () => {
    const files = [
        { id: 'lht', name: 'Projects', isDir: true },
        {
            id: 'mcd',
            name: 'chonky-sphere-v2.png',
            thumbnailUrl: 'https://chonky.io/chonky-sphere-v2.png',
        },
    ];
    const folderChain = [{ id: 'xcv', name: 'Demo', isDir: true }];
    return (
        <div className='full-page'>
            <div className='chonky'>
                <FullFileBrowser files={files} folderChain={folderChain} />
            </div>
        </div>
    );
}

export default HomePage;