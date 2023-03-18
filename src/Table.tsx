import React from 'react';
import { Playlist } from './types';

type TableProps = {
	playlists: Playlist[];
};

const Table: React.FC<TableProps> = ({ playlists }) => {
	return (
		<table>
			<thead>
				<tr>
					<th>Author</th>
					<th>Name</th>
					<th>Description</th>
					<th>Contacts</th>
					<th>Followers</th>
				</tr>
			</thead>
			<tbody>
				{playlists.map((playlist) => (
					<tr key={playlist.id}>
						<td>
							<a href={playlist.authorHref} target='_blank'>
								{playlist.author}
							</a>
						</td>
						<td>
							<a href={playlist.href} target='_blank'>
								{playlist.name}
							</a>
						</td>
						<td dangerouslySetInnerHTML={{ __html: playlist.description }} />
						<td
							dangerouslySetInnerHTML={{
								__html: playlist.contacts.join('<br/>'),
							}}
						/>
						<td>{playlist.followers}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default Table;
