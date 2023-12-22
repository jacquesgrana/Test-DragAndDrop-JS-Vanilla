const ENDPOINT = "http://localhost:5050/persons";

const getAll = async () => {
    try {
        const response = await fetch(ENDPOINT, 
            { method: "GET" }
            );
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error("Error fetching data:", error);
        throw error;  // Rethrow the error to handle it elsewhere if needed
    }
}

const patchRank = async (id, newRank) => {
    
    try {
        const response = await fetch(`${ENDPOINT}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "rank": newRank })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error updating rank:", error);
        throw error;  // Rethrow the error to handle it elsewhere if needed
    }
}


const applyRanksUpdates = async (updates) => {
    for (const update of updates) {
        //console.log('Updating rank:', update);
        try {
            const result = await patchRank(update.id, update.rank);
            console.log('Rank updated successfully:', result);
        } catch (error) {
            console.error('Error updating rank:', error);
            throw error;  // Rethrow the error to handle it elsewhere if needed
        }
    }
}

