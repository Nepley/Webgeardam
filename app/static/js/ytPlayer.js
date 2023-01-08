var player;
var socket;
var YtAPIReady = false;
var sync = false;
var currentInfos = [];
var firstActor = true;
var rand_id = (Math.random() + 1).toString(36).substring(7);

$(document).ready(function() {

    setupSocket();

    $("#loop").text("Loop: False\n");
    $("#shuffle").text("Shuffle: False\n");

    $("#load_btn").click(function() {
        socket.emit('player', { room: room, action: 'load', url: $('#url').val() });
    });

    $("#add_btn").click(function() {
        socket.emit('player', { room: room, action: 'add', url: $('#url').val() });
    });

    $("#play_btn").click(function() {
        socket.emit('player', { room: room, action: 'play' });
    });

    $("#pause_btn").click(function() {
        socket.emit('player', { room: room, action: 'pause' });
    });

    $("#loop_btn").click(function() {
        socket.emit('player', { room: room, action: 'loop' });
    });

    $("#shuffle_btn").click(function() {
        socket.emit('player', { room: room, action: 'shuffle' });
    });

    $("#mute_btn").click(function() {
        socket.emit('player', { room: room, action: 'mute' });
    });

    $("#start_btn").click(function() {
        $("#modalMutebtn").modal('hide');
        player.mute();
        player.setVolume(25);
    });

    $("#next_btn").click(function() {
        socket.emit('player', { room: room, action: 'next' });
    });

    $("#back_10_btn").click(function() {
        socket.emit('player', { room: room, action: 'back_10' });
    });

    $("#forward_10_btn").click(function() {
        socket.emit('player', { room: room, action: 'forward_10' });
    });

    $(document).on("click", ".delete_btn", function() {
        socket.emit('player', { room: room, action: 'delete', id: $(this).val() });
    });

    $(document).on("click", ".play_list_btn", function() {
        socket.emit('player', { room: room, action: 'playIndex', id: $(this).val() });
    });

    $("#volume").change(function() {
        player.setVolume($("#volume").val());
    });

    $("#load_playlist_file").click(function() {
        getPlaylistFromFile();
    });

    ///////////////////////////////////////////
    socket.on('player', function (data, cb) {
        switch(data['action'])
        {
            case 'next':
                player.next();
                updatePlaylist();
                updateInfo();
                break;
            case 'load':
                player.load(data['url']);
                player.seekT(0);
                updateInfo();
                $("#play_btn").css("display", "none");
                $("#pause_btn").css("display", "block");
                console.log("Play3");
                break;
            case 'play':
                player.play();
                updatePlaylist();
                updateInfo();
                $("#play_btn").css("display", "none");
                $("#pause_btn").css("display", "block");
                console.log("Play2");
                break;
            case 'playIndex':
                player.playIndex(data["id"]);
                updatePlaylist();
                updateInfo();
                $("#play_btn").css("display", "none");
                $("#pause_btn").css("display", "block");
                console.log("Play1");
                break;
            case 'pause':
                player.pause();
                $("#play_btn").css("display", "block");
                $("#pause_btn").css("display", "none");
                console.log("Pause1");
                break;
            case 'mute':
                player.mute();
                var color = player.isMute ? "white" : "#007bff";
                $("#mute_btn").css("border-color", color);
                break;
            case 'add':
                player.add(data['url']);
                updatePlaylist();
                break;
            case 'loop':
                player.changeLoop();
                text = "Loop: ";
                text += player.loop ? "True":"False";
                text += "\n";
                var color = player.loop ? "white" : "#007bff";
                $("#loop_btn").css("border-color", color);
                break;
            case 'shuffle':
                player.changeShuffle()
                text = "Shuffle: ";
                text += player.shuffle ? "True":"False";
                text += "\n";
                $("#shuffle").html(text);
                break;
            case 'delete':
                player.delete(data['id']);
                updatePlaylist();
                break;
            case 'loadPlaylist':
                // Clean current playlist
                player.playlist = [];
                listVideo = JSON.parse(data["playlist"]);
                for(var i = 0; i < listVideo.length; i++)
                {
                    player.add(listVideo[i]["url"], listVideo[i]["name"]);
                }
                updatePlaylist();
                break;
            case 'syncQuestion':
                socket.emit('player', { room: room, action: 'syncAnswer', playlist: player.getPlaylist(), currentPos: player.getPositionPlaylist(), currentVideoId: currentInfos["video_id"], pause: player.isPause(), currentVideoSecond: player.getCurrentTime(), loop: player.loop, mute: player.isMute, Asker: rand_id });
                break;
            case 'syncAnswer':
                if(data["Asker"] != rand_id && !sync)
                {
                    if(data["playlist"].length != 0)
                    {
                        player.setPlaylist(data["playlist"]);
                        player.setPositionPlaylist(data["currentPos"]);
                        player.load(data["currentVideoId"]);
                        if(data['loop'])
                        {
                            player.changeLoop();
                            $("#loop_btn").css("border-color", "white");
                        }

                        updatePlaylist();
                        updateInfo();
                        sync = true;
                        firstActor = false;
                        syncStart(data['currentVideoSecond'], data['pause']);
                    }
                }
                break;
            case 'back_10':
                player.seekTo(player.getCurrentTime()-10);
                break;
            case 'forward_10':
                player.seekTo(player.getCurrentTime()+10);
                break;
            default:
                console.log("Unknown action");
        }
      });

    setInterval(updateCurrentVideo, 100);
});

///////////////////////////////////////////
async function onYouTubeIframeAPIReady()
{
    player = new ytController('player', {'onStateChange': onPlayerStateChange, 'onReady': onReady});
    await sleep(1000);
    YtAPIReady = true;
}

function updatePlaylist()
{
    $("#playlist").empty();
    var counter = 1;
    for(video of player.playlist)
    {
        var selected = counter == player.id_playlist+1 ? ";background-color:#6c5ce7;color:white":"";
        // var div_video = "<div>"+counter+' - <a target="_blank" href="https://www.youtube.com/watch?v='+video['video_id']+'">'+video['title']+"</a> <button class='delete_btn' value='"+video['id']+"'>Delete</button>"+"</div><br>"
        var div_video = "<li style='display:flex;justify-content:space-between"+selected+"' class='list-group-item' id='btn_play_list' value='"+video['id']+"'><div data-toggle='tooltip' data-placement='left' title=\""+video['title']+"\" style='width:70%;overflow:hidden;white-space: nowrap;text-overflow:ellipsis;'>"+counter+" - "+video['title']+"</div> <button class='play_list_btn btn btn-sm btn-success' value='"+video['id']+"'>Play</button> <button class='delete_btn btn btn-sm btn-danger' value='"+video['id']+"'>Delete</button>"+"</li>"
        $("#playlist").append(div_video);
        counter++;
    }
}

async function updateInfo()
{
    var max = 1000;
    var retry = 0;
    while(player.getState() != YT.PlayerState.PLAYING && retry <= max)
    {
        await sleep(1000);
        retry++;
    }

    var infos = player.getCurrentInfos();
    $("#info_video").empty();
    var div_info = "<a style='color:white' target='_blank' href='https://www.youtube.com/watch?v="+infos["video_id"]+"'>"+infos['title']+"</a>";
    $("#info_video").append(div_info);
    
    currentInfos = infos;
}

function onReady()
{
    $("#player").css("display", "block");
}

function onPlayerStateChange()
{
    if(player.getState() == YT.PlayerState.ENDED)
    {
        // if(firstActor)
        // {
        //     socket.emit('player', { room: room, action: 'next' });
        // }
        player.next();
        updatePlaylist();
        updateInfo();
    }
}

async function setupSocket()
{
    socket = io('', {
        path: '/ws/socket.io'
    });

    // We join the room
    socket.emit("join_room", room)

    // We join the master room
    socket.emit("join_room", "master"+room)

    // We join a temporary room in order to ask for a sync
    room_tmp = rand_id+"_"+room
    socket.emit("join_room", room_tmp)

    // We wait for the API to be loaded
    while(!YtAPIReady)
    {
        await sleep(1000);
    }

    // We emit a sync request in case someone was already here
    socket.emit('player', { room: "master"+room, action: 'syncQuestion', roomAsking: room_tmp });

    // We wait for the potential sync to be done
    await sleep(1000)

    // We leave the temporary room
    socket.emit("leave_room", room_tmp)

    // We ask the user to start in order to unmute the player
    $("#modalMutebtn").modal({backdrop: 'static', keyboard: false});
}

function getPlaylistFromFile()
{
    var fileToLoad = document.getElementById("playlist_file").files[0];

    var reader = new FileReader();
    reader.readAsText(fileToLoad, "UTF-8");
    reader.onload = function(evt)
    {
        socket.emit('player', { room: room, action: 'loadPlaylist', playlist: evt.target.result});
    }
    reader.onerror = function(evt)
    {
        console.log(evt);
    }
}

async function updateCurrentVideo()
{
    if(YtAPIReady)
    {
        var start = 11;
        if(player.getTotalTime() < 3600)
        {
            start = 14;
        }
        var totalLength = new Date(player.getTotalTime() * 1000).toISOString().substring(start, 19);
        var currentTime = new Date(player.getCurrentTime() * 1000).toISOString().substring(start, 19);
        var div_info = currentTime+"/"+totalLength;
        $("#info_video_player").html(div_info);
    }
}

async function syncStart(sec, pause)
{
    if(YtAPIReady)
    {
        await sleep(1000);
        player.seekTo(sec);

        if(pause)
        {
            player.pause();
            $("#play_btn").css("display", "block");
            $("#pause_btn").css("display", "none");
        }
    }
}

function sleep(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}