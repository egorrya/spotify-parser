export const getToken = async () => {
	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${btoa(
				`${import.meta.env.VITE_SPOTIFY_CLIENT_ID}:${
					import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
				}`
			)}`,
		},
		body: 'grant_type=client_credentials',
	});
	const data = await response.json();
	return data.access_token;
};

export const getPlaylists = async (
	query: string,
	offset: number = 0,
	limit: number = 20
) => {
	const accessToken = await getToken();
	const response = await fetch(
		`https://api.spotify.com/v1/search?q=${query}&type=playlist&offset=${offset}&limit=${limit}`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		}
	);
	const data = await response.json();
	const playlists = data.playlists.items;

	const promises = playlists.map(async (playlist: any) => {
		const [playlistData, profileData] = await Promise.all([
			fetch(`https://api.spotify.com/v1/playlists/${playlist.id}`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}).then((response) => response.json()),
			fetch(`https://api.spotify.com/v1/users/${playlist.ownerId}`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}).then((response) => response.json()),
		]);

		return {
			name: playlistData.name,
			href: playlistData.external_urls.spotify,
			description: playlistData.description,
			followers: playlistData.followers.total,
		};
	});

	return Promise.all(promises);
};
