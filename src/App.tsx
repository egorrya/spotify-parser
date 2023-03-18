import React, { useState } from 'react';
import AddMoreButton from './AddMoreButton';
import { getDiscoveredOn, getPlaylists } from './api';
import { useGetTokens } from './hooks/useGetTokens';
import Table from './Table';
import { Playlist } from './types';

type SearchType = 'playlist' | 'artist';

const DEFAULT_LIMIT = 50;

const App: React.FC = () => {
	useGetTokens();

	const [playlists, setPlaylists] = useState<Playlist[]>([]);
	const [offset, setOffset] = useState(0);
	const [query, setQuery] = useState('');
	const [searchType, setSearchType] = useState<SearchType>('playlist');
	const [total, setTotal] = useState(0);
	const [hideSpotify, setHideSpotify] = useState(false);

	const activeRequest = async (
		query: string,
		offset?: number,
		limit?: number
	) => {
		if (searchType === 'playlist') {
			const { items, total } = await getPlaylists(query, offset, limit);

			setTotal(total);

			return items;
		}

		if (searchType === 'artist') return await getDiscoveredOn(query);
	};

	const loadMore = async () => {
		const newPlaylists = await activeRequest(query, offset);
		await setPlaylists([...playlists, ...(newPlaylists as Playlist[])]);
		await setOffset(offset + DEFAULT_LIMIT);
		console.log('offset', offset);
	};

	const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setSearchType(event.target.value as SearchType);
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const newPlaylists = await activeRequest(query, 0);
		await setPlaylists(newPlaylists as Playlist[]);
		await setOffset(DEFAULT_LIMIT);
	};

	const privateToken = sessionStorage.getItem('privateToken');

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<select value={searchType} onChange={handleSelectChange}>
					<option value='playlist'>Playlists Search</option>
					<option value='artist'>Artist's Discovered On</option>
				</select>

				{!privateToken && searchType === 'artist' ? (
					<a href='https://spotify.com' target='_blank'>
						Login On Spotify and reload that page
					</a>
				) : (
					<>
						<input
							type='text'
							value={query}
							onChange={(e) => setQuery(e.target.value)}
						/>
						<button type='submit'>Search</button>
					</>
				)}

				<div>
					<label htmlFor='hideSpotify'>Hide playlists by Spotify:</label>
					<input
						type='checkbox'
						id='hideSpotify'
						name='hideSpotify'
						checked={hideSpotify}
						onChange={(e) => setHideSpotify(e.target.checked)}
					/>
				</div>
			</form>

			{playlists.length > 0 && (
				<Table
					playlists={
						hideSpotify
							? playlists.filter((p) => p.author !== 'Spotify')
							: playlists
					}
				/>
			)}

			{playlists.length > 0 && total >= offset && searchType === 'playlist' && (
				<AddMoreButton onClick={loadMore} />
			)}
		</div>
	);
};

export default App;
