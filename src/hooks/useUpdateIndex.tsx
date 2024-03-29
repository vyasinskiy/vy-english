import { useState } from 'react';
import { getRandomInt } from './helpers';

export function useUpdateIndex() {
	const [currentIndex, setCurrentIndex] = useState<number>(0);

	const updateIndex = (arrayLength: number) => {
		const maxIndex = arrayLength - 1;
		let newIndex = getRandomInt(maxIndex, currentIndex);

		while (!isAcceptedIndex(currentIndex, newIndex, maxIndex)) {
			newIndex = getRandomInt(maxIndex, currentIndex);
		}

		setCurrentIndex(newIndex);
	};

	return { currentIndex, updateIndex };
}

function isAcceptedIndex(
	currentIndex: number,
	newIndex: number,
	maxIndex: number
) {
	const acceptedAsSecondToLast = newIndex === 1 && maxIndex === 1;
	const acceptedAsLastWord = currentIndex === 1 && newIndex === 0 && maxIndex === 0;
	// we must avoid index === 0 to proceed with rerender after index update
	// as at the end of the game index may be changed from 0 => 0 withour rerender
	const acceptedAsNotZero =
		newIndex !== 0 && !acceptedAsLastWord && !acceptedAsSecondToLast;

	return acceptedAsLastWord || acceptedAsSecondToLast || acceptedAsNotZero;
}
