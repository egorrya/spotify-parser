import { regexEmail, regexIG, regexLink } from './utils/regex';

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

export const getToken = () => {
	return fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
		},
		body: 'grant_type=client_credentials',
	})
		.then((data) => data.json())
		.then((data) => data.access_token);
};

export const getPrivateToken = async () => {
	const accessToken = await fetch('https://open.spotify.com')
		.then((response) => response.text())
		.then((html) => {
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');
			const scriptElement = doc.querySelector('#session');

			if (scriptElement) {
				const jsonDataString = scriptElement.textContent;
				const extractedJson = JSON.parse(jsonDataString as string);
				return extractedJson.accessToken;
			} else {
				return null;
			}
		});

	return accessToken;
};

export const getPlaylists = async (
	query: string,
	offset: number = 0,
	limit: number = 50
) => {
	const accessToken = sessionStorage.getItem('token');

	const response = await fetch(
		`https://api.spotify.com/v1/search?q=${query}&type=playlist&offset=${offset}&limit=${limit}`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		}
	);
	const data = await response.json();
	const playlists = data.playlists;

	const promises = playlists.items.map(async (playlist: any) => {
		const [playlistData] = await Promise.all([
			fetch(`https://api.spotify.com/v1/playlists/${playlist.id}`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}).then((response) => response.json()),
		]);

		const contactMatches =
			(playlistData.description || '').match(regexEmail) || [];
		const igMatches = (playlistData.description || '').match(regexIG) || [];
		const linkMatches = (playlistData.description || '').match(regexLink) || [];

		return {
			id: playlist.id,
			name: playlistData.name,
			href: playlistData.external_urls.spotify,
			description: playlistData.description,
			followers: playlistData.followers.total,
			author: playlist.owner.display_name,
			authorHref: playlist.owner.external_urls.spotify,
			contacts: [...contactMatches, ...igMatches, ...linkMatches].filter(
				(match, index, arr) => arr.indexOf(match) === index
			),
		};
	});

	const newPlaylists = await Promise.all(promises);
	const uniquePlaylists = newPlaylists.filter(
		(playlist, index, arr) =>
			arr.findIndex((p) => p.id === playlist.id) === index
	);

	return { items: uniquePlaylists, total: playlists.total };
};

export const getDiscoveredOn = async (query: string) => {
	const accessToken = sessionStorage.getItem('token');
	const privateToken = sessionStorage.getItem('privateToken');

	const artistSearchInfo = await fetch(
		`https://api.spotify.com/v1/search?q=${query}&type=artist`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		}
	).then((response) => response.json());

	const artistId = artistSearchInfo.artists.items[0].id;

	const playlists = await fetch(
		`https://api-partner.spotify.com/pathfinder/v1/query?operationName=queryArtistDiscoveredOn&variables=%7B%22uri%22%3A%22spotify%3Aartist%3A${artistId}%22%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%226ed3d339827c96f7220da43131006bee86fed821e2232eca32f6bde614defa65%22%7D%7D`,
		{
			headers: {
				Authorization: `Bearer ${privateToken}`,
			},
		}
	)
		.then((res) => res.json())
		.then((res) => res.data.artistUnion.relatedContent.discoveredOnV2.items);

	const promises = playlists.map(async (playlist: any) => {
		if (playlist.data.__typename === 'NotFound') {
			return {
				id: Math.random().toString(36).substring(7),
				name: "Can't find playlist",
			};
		}

		const [playlistData] = await Promise.all([
			fetch(
				`https://api.spotify.com/v1/playlists/${
					playlist.data.uri.split('spotify:playlist:')[1]
				}`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			).then((response) => response.json()),
		]);

		const contactMatches =
			(playlistData.description || '').match(regexEmail) || [];
		const igMatches = (playlistData.description || '').match(regexIG) || [];
		const linkMatches = (playlistData.description || '').match(regexLink) || [];

		return {
			id: playlist.data.uri.split('spotify:playlist:')[1],
			name: playlistData.name,
			href: playlistData.external_urls.spotify,
			description: playlistData.description,
			followers: playlistData.followers.total,
			author: playlistData.owner.display_name,
			authorHref: playlistData.owner.external_urls.spotify,

			contacts: [...contactMatches, ...igMatches, ...linkMatches].filter(
				(match, index, arr) => arr.indexOf(match) === index
			),
		};
	});

	const newPlaylists = await Promise.all(promises);
	const uniquePlaylists = newPlaylists.filter(
		(playlist, index, arr) =>
			arr.findIndex((p) => p.id === playlist.id) === index
	);

	return uniquePlaylists;
};
