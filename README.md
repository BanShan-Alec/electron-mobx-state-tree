# Electron-MST

`electron-mst` is a end-to-end electron state management to synchronization status across multiple electron processes, powered by mobx-state-tree.

You can use `electron-mst` with a a simple and elegant way like using mobx. 

You also can use `mobx-state-tree` together with React, or with any other view library.

## ✨Installation

> Generally, your packageManager you help auto install the peerDependencies. (electron & mobx-state-tree)

```sh
# with yarn
yarn add electron-redux

# with pnpm
pnpm install electron-redux
```

## 👀 Overview

📦 Ready out of the box  
🎯 Based on the official [mobx-state-tree](https://mobx-state-tree.js.org/), api will be familiar to you if you have used MST
🌱 High cohesion & Low coupling; Highly readable  
💪 Cross-process communication is aided by Electron's native ipc channel, which supports preload's sandbox mode by default  
🔩 Supports C/C++ native addons  
🐞 Debugger configuration included  
🖥 Supports the creation of multiple MST stores and MST Store nesting 

## 🛫 Quick Setup

```sh
# clone the project
git clone https://github.com/electron-vite/electron-vite-react.git

# enter the project directory
cd electron-vite-react

# install dependency
npm install

# develop
npm run dev
```

## 🌱 Friendly Demo

> demo boilerplate power by `electron-vite`

```sh
# clone the project
git clone https://github.com/BanShan-Alec/electron-mobx-state-tree

# enter the project directory
cd electron-mobx-state-tree

# install dependency
pnpm install

# try it by yourself
pnpm run dev
```



## ⚙️Documentation

### Basic Example

#### Step0: expose electron-mst bridge

```ts
// electron/preload/index.ts
import { exposeMSTBridge } from 'electron-mst/preload';

exposeMSTBridge();
```

t

#### Step1: decalre a model

```ts
// shared/store/user.ts
import { createStore } from 'electron-mst';
import { types } from 'mobx-state-tree';

export const UserStore = types
    .model({
        name: types.string,
        age: types.number,
    })
    .views((ctx) => {
        return {
            get isAdult() {
                return ctx.age >= 18;
            },
        };
    })
    .actions((ctx) => {
        return {
            updateName(name: string) {
                ctx.name = name;
            },
            updateAge(age: number) {
                ctx.age = age;
            },
        };
    });

export const user$ = createStore(UserStore, {
    name: 'Jack',
    age: 18,
});
```

#### Step2: init sdk in main process

```ts
// electron/main/index.ts
import { initMST } from 'electron-mst/main';
import { UserStore } from '../../src/store/user';

initMST([
    {
        store: UserStore,
    },
]);
```

#### Step3: use storeInstance in renderer

```tsx
// src/App.tsx
import React from 'react';
import { useEffect, useState } from 'react';
import logoVite from './assets/logo-vite.svg';
import logoElectron from './assets/logo-electron.svg';
import './App.css';
import { observer } from 'mobx-react-lite';
import { home$ } from './store/home';
import { user$ } from './store/user';
//私有常量

//可抽离的逻辑处理函数/组件

let App = (props: IProps) => {
    //变量声明、解构
    const {} = props;
    const { age, updateAge } = user$;
    //组件状态

    //网络IO

    //数据转换

    //逻辑处理函数
    const handleCreateWindow = (e: any) => {
        // self-realization...
    };

    //组件Effect
    useEffect(() => {
        console.log("age changed", age)
    }, [age]);

    //组件渲染
    return (
        <div className="card">
            <code>{JSON.stringify(user$, null, 2)}</code>
            <button
                onClick={() => {
                    updateAge(age + 2);
                }}
                >
                Update User
            </button>
        </div>
    );
};

//props类型定义
interface IProps {}

App = observer(App);
export default App;

```

Step4: new another window to view the user$

> You can view the user$ state has synchronization between two Renderer

![image-20241107224011472](https://raw.githubusercontent.com/BanShan-Alec/electron-mobx-state-tree/refs/heads/README.assets/basic-demo.png)

### More Example

#### Watch State Change In Main Process

TODO

## 🎯Realize & Design

TODO

## ❔ FAQ

TODO
