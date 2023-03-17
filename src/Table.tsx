import React from 'react';

type Playlist = {
	name: string;
	description: string;
	followers: number;
	href: string;
};

type TableProps = {
	playlists: Playlist[];
};

const Table: React.FC<TableProps> = ({ playlists }) => {
	return (
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Description</th>
					<th>Followers</th>
				</tr>
			</thead>
			<tbody>
				{playlists.map((playlist) => (
					<tr key={playlist.name}>
						<td>
							<a href={playlist.href}>{playlist.name}</a>
						</td>
						<td>{playlist.description}</td>
						<td>{playlist.followers}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default Table;
