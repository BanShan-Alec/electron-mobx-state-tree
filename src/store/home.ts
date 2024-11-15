import { createStore } from 'electron-mst';
// import { createStore } from '../../lib';
import { types } from 'mobx-state-tree';
import { UserStore } from './user';

const HomeStore = types
    .model('home', {
        count: types.number,
        user: types.optional(
            // 嵌套models
            UserStore,
            { name: 'Alec', age: 20, sex: 0 }
        ),
    })
    .views((ctx) => {
        return {
            get isEven() {
                return ctx.count % 2 === 0;
            },
        };
    })
    .actions((ctx) => {
        return {
            add() {
                ctx.count = ctx.count + 1;
            },
        };
    });

const HomeStoreSnapshot: Parameters<(typeof HomeStore)['create']>[0] = { count: 0 };

const home$ = createStore(HomeStore, HomeStoreSnapshot);

export { HomeStore, HomeStoreSnapshot, home$ };
