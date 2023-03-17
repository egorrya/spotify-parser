import React, { useState } from 'react';
import AddMoreButton from './AddMoreButton';
import { getPlaylists } from './api';
import Table from './Table';

type Playlist = {
	name: string;
	description: string;
	followers: number;
	href: string;
};

const App: React.FC = () => {
	const [playlists, setPlaylists] = useState<Playlist[]>([]);
	const [offset, setOffset] = useState(0);
	const [query, setQuery] = useState('');

	const loadMore = async () => {
		const newPlaylists = await getPlaylists(query, offset, 20);
		await setPlaylists([...playlists, ...newPlaylists]);
		await setOffset(offset + 20);
		console.log('offset', offset);
	};

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(event.target.value);
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const newPlaylists = await getPlaylists(query, 0);
		setPlaylists(newPlaylists);
		setOffset(20);
	};

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<input type='text' value={query} onChange={handleInputChange} />
				<button type='submit'>Search</button>
			</form>
			{playlists.length > 0 && (
				<>
					<Table playlists={playlists} />
					<AddMoreButton onClick={loadMore} />
				</>
			)}
		</div>
	);
};

export default App;
