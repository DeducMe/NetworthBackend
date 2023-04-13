export function checkTypes<T extends { [key: string]: any }>(obj: Record<keyof T, unknown>, types: T): boolean {
    return Object.keys(types).every((key) => {
        const type = types[key];

        if (typeof type === 'string') {
            if (typeof obj[key] === type) {
                return true;
            }
        } else {
            const keys = Object.keys(type) as Array<keyof typeof type>;
            const partialObj: Partial<Record<keyof typeof type, unknown>> = {};

            keys.forEach((prop) => {
                // @ts-ignore
                partialObj[prop] = obj[key][prop];
            });

            if (checkTypes(partialObj as T[keyof T], type)) {
                return true;
            }
        }

        return false;
    });
}
