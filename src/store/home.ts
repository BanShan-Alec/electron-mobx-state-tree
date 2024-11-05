import { types } from 'mobx-state-tree';

const HomeStore = types
    .model('home', {
        count: types.number,
        user: types.optional(
            types.model({
                name: types.string,
                age: types.number,
            }),
            { name: 'Alec', age: 20 }
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
            updateUser() {
                // uuid
                ctx.user.name = 'hello_' + URL.createObjectURL(new Blob()).split('/')[3];
                ctx.user.age = parseInt((Math.random() * 100).toFixed(0), 10);
            },
        };
    });

const home$ = HomeStore.create({
    count: 0,
});

export { HomeStore, home$ };
