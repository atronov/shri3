/**
 * Created by atronov on 05.08.15.
 */

/**
 * Читает теги формата ID3v1
 * @param {ArrayBuffer} recordData байты файла
 * @returns {{}} объект с тегами
 */
function getTags(recordData) {
    var tags = {};
    var id3v1Length = 128;
    var id3v1ExtLength = 227;
    if (recordData && recordData.byteLength > id3v1Length) {
        var id3v1Data =  new Uint8Array(recordData, recordData.byteLength - id3v1Length, id3v1Length);
        var offset = 0;
        var tagTitle = arrayToString(id3v1Data.subarray(offset, offset+=3));
        if (tagTitle === "TAG") {
            tags.title = arrayToString(id3v1Data.subarray(offset, offset+=30));
            tags.artist = arrayToString(id3v1Data.subarray(offset, offset+=30));
            tags.album = arrayToString(id3v1Data.subarray(offset, offset+=30));
            tags.year = arrayToString(id3v1Data.subarray(offset, offset+=4));
            var hasNumber = id3v1Data[offset+28] === 0;
            if (hasNumber) {
                tags.comment = arrayToString(id3v1Data.subarray(offset, offset+=28));
                offset++; // один байт - флаг наличия номера
                tags.track = id3v1Data[offset++];
            } else {
                tags.comment = arrayToString(id3v1Data.subarray(offset, offset+=30));
            }
            var genreIndex = id3v1Data[offset++];
            tags.genre = getGenreByInd(genreIndex);
            if (recordData.byteLength > id3v1ExtLength + id3v1Length) {
                var id3v1ExtData = new Uint8Array(recordData, recordData.byteLength - id3v1Length - id3v1ExtLength,
                    id3v1ExtLength);
                offset = 0;
                var tagPlusTitle = arrayToString(id3v1ExtData.subarray(offset, offset+=4));
                if (tagPlusTitle === "TAG+") {
                    tags.fileName += arrayToString(id3v1ExtData.subarray(offset, offset+=60));
                    tags.artist += arrayToString(id3v1ExtData.subarray(offset, offset+=60));
                    tags.album += arrayToString(id3v1ExtData.subarray(offset, offset+=60));
                }
            }
        }
    }
    return tags;
}

/**
 * @param {number} genreInd индекс жанра из ID3v1 тега
 * @returns {string} Название жанра
 */
function getGenreByInd(genreInd) {
    // http://www.linuxselfhelp.com/HOWTO/MP3-HOWTO-13.html#ss13.3
    var genres = ["Blues"
        ,"Classic Rock"
        ,"Country"
        ,"Dance"
        ,"Disco"
        ,"Funk"
        ,"Grunge"
        ,"Hip-Hop"
        ,"Jazz"
        ,"Metal"
        ,"New Age"
        ,"Oldies"
        ,"Other"
        ,"Pop"
        ,"R&B"
        ,"Rap"
        ,"Reggae"
        ,"Rock"
        ,"Techno"
        ,"Industrial"
        ,"Alternative"
        ,"Ska"
        ,"Death Metal"
        ,"Pranks"
        ,"Soundtrack"
        ,"Euro-Techno"
        ,"Ambient"
        ,"Trip-Hop"
        ,"Vocal"
        ,"Jazz+Funk"
        ,"Fusion"
        ,"Trance"
        ,"Classical"
        ,"Instrumental"
        ,"Acid"
        ,"House"
        ,"Game"
        ,"Sound Clip"
        ,"Gospel"
        ,"Noise"
        ,"AlternRock"
        ,"Bass"
        ,"Soul"
        ,"Punk"
        ,"Space"
        ,"Meditative"
        ,"Instrumental Pop"
        ,"Instrumental Rock"
        ,"Ethnic"
        ,"Gothic"
        ,"Darkwave"
        ,"Techno-Industrial"
        ,"Electronic"
        ,"Pop-Folk"
        ,"Eurodance"
        ,"Dream"
        ,"Southern Rock"
        ,"Comedy"
        ,"Cult"
        ,"Gangsta"
        ,"Top 40"
        ,"Christian Rap"
        ,"Pop/Funk"
        ,"Jungle"
        ,"Native American"
        ,"Cabaret"
        ,"New Wave"
        ,"Psychadelic"
        ,"Rave"
        ,"Showtunes"
        ,"Trailer"
        ,"Lo-Fi"
        ,"Tribal"
        ,"Acid Punk"
        ,"Acid Jazz"
        ,"Polka"
        ,"Retro"
        ,"Musical"
        ,"Rock & Roll"
        ,"Hard Rock"
        ,"Folk"
        ,"Folk-Rock"
        ,"National Folk"
        ,"Swing"
        ,"Fast Fusion"
        ,"Bebob"
        ,"Latin"
        ,"Revival"
        ,"Celtic"
        ,"Bluegrass"
        ,"Avantgarde"
        ,"Gothic Rock"
        ,"Progressive Rock"
        ,"Psychedelic Rock"
        ,"Symphonic Rock"
        ,"Slow Rock"
        ,"Big Band"
        ,"Chorus"
        ,"Easy Listening"
        ,"Acoustic"
        ,"Humour"
        ,"Speech"
        ,"Chanson"
        ,"Opera"
        ,"Chamber Music"
        ,"Sonata"
        ,"Symphony"
        ,"Booty Bass"
        ,"Primus"
        ,"Porn Groove"
        ,"Satire"
        ,"Slow Jam"
        ,"Club"
        ,"Tango"
        ,"Samba"
        ,"Folklore"
        ,"Ballad"
        ,"Power Ballad"
        ,"Rhythmic Soul"
        ,"Freestyle"
        ,"Duet"
        ,"Punk Rock"
        ,"Drum Solo"
        ,"A capella"
        ,"Euro-House"
        ,"Dance Hall"];
    return genres[genreInd];
}

/**
 * @param {ByteArray|Uint8Array} array
 * @returns {string}
 */
function arrayToString(array) {
    var data = (array instanceof Uint8Array)? array: new Uint8Array(array);
    return String.fromCharCode.apply(null, data);
}

function bytesToString(bytes) {
    var dataView = new DataView(bytes);
    if ('TextDecoder' in window) {
        var decoder = new TextDecoder("utf8");
        var text = decoder.decode(dataView);
        return text;
    } else {
        console.warn("Browser does not support encoding API. Tags can be decoded incorrect.");
        return String.fromCharCode.apply(null, new Uint16Array(bytes));
    }
}

function _arrayBufferToString(buf, callback) {
    var bb = new Blob([new Uint8Array(buf)]);
    var f = new FileReader();
    f.onload = function(e) {
        callback(e.target.result);
    };
    f.readAsText(bb);
}