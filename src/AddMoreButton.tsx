import React from 'react';

type AddMoreButtonProps = {
	onClick: () => void;
};

const AddMoreButton: React.FC<AddMoreButtonProps> = ({ onClick }) => {
	return <button onClick={onClick}>Add More</button>;
};

export default AddMoreButton;
