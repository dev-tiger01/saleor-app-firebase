const prefix = 'saleor.app.firebase';

const addPrefix = (key: string) => {
    key = key.charAt(0).toUpperCase() + key.slice(1);
    return `${prefix}-${key}`
}

export const keys = {
    id: addPrefix('uid') as string,
    phone: 'PhoneNumber'
}