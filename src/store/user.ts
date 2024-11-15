import { createStore } from 'electron-mst';
// import { createStore } from '../../lib';
import { types } from 'mobx-state-tree';

export enum EUserSex {
    other,
    male,
    female,
}

export const UserStore = types
    .model({
        name: types.string,
        age: types.number,
        // sex: types.enumeration(['male', 'female', 'other']),
        sex: types.frozen<EUserSex>(),
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
            updateSex(sex: EUserSex) {
                ctx.sex = sex;
            },
        };
    });

export const user$ = createStore(UserStore, {
    name: 'Jack',
    age: 18,
    sex: EUserSex.male,
});
