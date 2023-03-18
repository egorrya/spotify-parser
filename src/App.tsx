import React, { useState } from 'react';
import AddMoreButton from './AddMoreButton';
import { getDiscoveredOn, getPlaylists } from './api';
import { useGetTokens } from './hooks/useGetTokens';
import Table from './Table';

type Playlist = {
	id: string;
	name: string;
	description: string;
	followers: number;
	href: string;
};

type SearchType = 'playlist' | 'artist';

const DEFAULT_LIMIT = 50;

const App: React.FC = () => {
	useGetTokens();

	const [playlists, setPlaylists] = useState<Playlist[]>([]);
	const [offset, setOffset] = useState(0);
	const [query, setQuery] = useState('');
	const [searchType, setSearchType] = useState<SearchType>('playlist');
	const [total, setTotal] = useState(0);

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

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(event.target.value);
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const newPlaylists = await activeRequest(query, 0);
		setPlaylists(newPlaylists as Playlist[]);
		setOffset(DEFAULT_LIMIT);
	};

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<select value={searchType} onChange={handleSelectChange}>
					<option value='playlist'>Playlists Search</option>
					{sessionStorage.getItem('privateToken') && (
						<option value='artist'>Artist's Discovered On</option>
					)}
				</select>

				<input type='text' value={query} onChange={handleInputChange} />
				<button type='submit'>Search</button>
			</form>
			{playlists.length > 0 && <Table playlists={playlists} />}

			{playlists.length > 0 && total >= offset && searchType === 'playlist' && (
				<AddMoreButton onClick={loadMore} />
			)}
		</div>
	);
};

export default App;
