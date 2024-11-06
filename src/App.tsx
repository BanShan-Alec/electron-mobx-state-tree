import React from 'react';
import { useEffect, useState } from 'react';
import logoVite from './assets/logo-vite.svg';
import logoElectron from './assets/logo-electron.svg';
import './App.css';
import { observer } from 'mobx-react-lite';
import { createStore } from '../lib/render';
import { HomeStore } from './store/home';
// import { home$ } from './store/home';
//私有常量
const home$ = createStore(HomeStore, { count: 0 });

//可抽离的逻辑处理函数/组件

let App = (props: IProps) => {
    //变量声明、解构
    const {} = props;
    const { count, add, isEven, user, updateUser } = home$;
    //组件状态

    //网络IO

    //数据转换

    //逻辑处理函数
    const handleCreateWindow = (e: any) => {
        e.preventDefault();
        window.electronAPI.createWindow();
    };

    //组件Effect
    useEffect(() => {
        postMessage({ payload: 'removeLoading' }, '*');
    }, []);

    //组件渲染
    return (
        <div className="App">
            <div className="logo-box">
                <a href="" onClick={handleCreateWindow}>
                    <img src={logoVite} className="logo vite" alt="Electron + Vite logo" />
                    <img src={logoElectron} className="logo electron" alt="Electron + Vite logo" />
                </a>
            </div>
            <h1>Electron + Mobx State Tree</h1>
            <div className="card">
                <button className={isEven ? 'text-green-400' : 'text-white'} onClick={() => add()}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Electron + Vite logo to <b>`New Another Window`</b>
            </p>
            <div className="card">
                <code>{JSON.stringify(user, null, 2)}</code>
                <button
                    onClick={() => {
                        updateUser();
                    }}
                >
                    Update User
                </button>
            </div>
        </div>
    );
};

//props类型定义
interface IProps {}

App = observer(App);
export default App;
