import { useEffect } from 'react';
import { getToken } from '../api';
import { getPrivateToken } from './../api';

export const useGetTokens = () => {
	useEffect(() => {
		getPrivateToken().then((token) => {
			if (token) sessionStorage.setItem('privateToken', token);
			if (!token) sessionStorage.removeItem('privateToken');
		});

		getToken().then((token) => {
			sessionStorage.setItem('token', token);
		});
	}, []);
};
