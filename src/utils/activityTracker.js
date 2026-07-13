const viewedIds = new Set();
const clickedIds = new Set();

/**
 * Retorna true se o id fornecido ainda não tiver sido marcado como visualizado nesta sessão de execução do aplicativo.
 * Em caso afirmativo, marca-o como visualizado.
 * @param {string} id
 * @returns {boolean}
 */
export const trackViewed = (id) => {
    if (!viewedIds.has(id)) {
        viewedIds.add(id);
        return true;
    }
    return false;
};

/**
 * Retorna true se o id fornecido ainda não tiver sido marcado como clicado nesta sessão de execução do aplicativo.
 * Em caso afirmativo, marca-o como clicado.
 * @param {string} id
 * @returns {boolean}
 */
export const trackClicked = (id) => {
    if (!clickedIds.has(id)) {
        clickedIds.add(id);
        return true;
    }
    return false;
};

const announcementViewedIds = new Set();

/**
 * Retorna true se o id de aviso fornecido ainda não tiver sido marcado como visualizado nesta sessão de execução do aplicativo.
 * Em caso afirmativo, marca-o como visualizado.
 * @param {string} id
 * @returns {boolean}
 */
export const trackAnnouncementViewed = (id) => {
    if (!announcementViewedIds.has(id)) {
        announcementViewedIds.add(id);
        return true;
    }
    return false;
};
