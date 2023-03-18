export const regexIG =
	/(^|)@([A-Za-z0-9_]+)|(ig: |instagram: )([A-Za-z0-9_]+)/gi;

export const regexEmail = /([\w.+-]+@[a-z\d-]+\.[a-z]+)/gi;
export const regexLink = /(?<=href=["'])([^"']*)(?=["'])/;
