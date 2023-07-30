

/**
 * Send post request to specified http address with content type and 
 * return type is `application/json`
 * 
 * Params:
 * - `url` The string represents the API URL address
 * - `body` Json body that will be sent as the body of 
 * the post request
 * 
 * Notice:
 * - This method will automatically stringify the 
 * body param before sending request
 */
export async function post(url: string, body: any): Promise<string | any> {
    let res = await fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    if (res.status !== 200) {
        throw '[NetworkError] Failed to request result from server, please try ' +
        'again later';
    }
    return (await res.json());
}