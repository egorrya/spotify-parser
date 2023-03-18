import { useEffect } from 'react';
import { getToken } from '../api';
import { getPrivateToken } from './../api';

export const useGetTokens = () => {
	useEffect(() => {
		getPrivateToken().then((token) => {
			sessionStorage.setItem('privateToken', token);
		});

		getToken().then((token) => {
			sessionStorage.setItem('token', token);
		});
	}, []);
};
