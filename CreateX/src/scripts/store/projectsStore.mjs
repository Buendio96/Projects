import fetchData from '@js-api/getData';
import { YYYY_MM_DD, filterByDate } from '@js-modules/filterByDate';
import sortByDate from '@js-modules/sortByDate';

const PROJECTS_STORE = {
	allProjects: [],
	byDateProjects: []
};



const initGetFiltredData = async (from, to = 3) => {
	try {
		if (filterByDate !== undefined) {
			const FROM_DATE = YYYY_MM_DD(from);
			const TO_DATE = filterByDate(to);
			const PROJECTS_API = `http://localhost:4100/projects?date_gte=${TO_DATE}&date_lte=${FROM_DATE}`;
			const DATA = await fetchData(PROJECTS_API);
			PROJECTS_STORE.byDateProjects = sortByDate(DATA);
		};
	} catch (error) {
		console.log(error)
	}
};

export { PROJECTS_STORE, initGetFiltredData };