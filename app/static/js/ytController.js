class ytController
{
	player;
	id_playlist = -1;
	playlist = [];
	loop = false;
	shuffle = false;
	shuffle_already_play = [];
	is_pause = false;

	constructor(id, event_func = [])
	{
		window.YT.ready(function() {
			player = new YT.Player(id, {
			height: '360',
			width: '640',
			videoId: '',
			playerVars: {
				'controls': 0,
				'rel' : 0,
				'fs' : 0,
				'showinfo': 0,
				'autoplay': 1,
				'mute': 1
			},
			events: event_func
			});
		})
		// Add autoplay
		// player.h.setAttribute('allow', "autoplay")
		// console.log(player.h);
		this.player = player;
	}

	load(url)
	{
		if(url.includes("youtube"))
		{
			var url_arr = url.split('v=');
			url = url_arr[1];

			if(url.includes("&"))
			{
				url_arr = url.split("&");
				url = url_arr[0];
			}
		}
		this.player.loadVideoById(url);
	}

	cue(url)
	{
		if(url.includes("youtube"))
		{
			var url_arr = url.split('v=');
			url = url_arr[1];

			if(url.includes("&"))
			{
				url_arr = url.split("&");
				url = url_arr[0];
			}
		}
		this.player.cueVideoById(url);
	}

	add(url, title = "")
	{
		var infos;
		if(url.includes("youtube"))
		{
			var url_arr = url.split('v=');
			url = url_arr[1];

			if(url.includes("&"))
			{
				url_arr = url.split("&");
				url = url_arr[0];
			}
		}

		$.ajax({
			url: 'https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v='+url+'&format=json',
			async: false,
			dataType: 'json',
			success: function (json) {
				infos = json;
			}
		});

		if(typeof infos !== 'undefined')
		{
			// Add Id of URL
			infos['video_id'] = url;

			// If a title is set, we change it
			if(title != "")
			{
				infos["title"] = title;
			}

			// Add id of playlist, we add 1 to the last id known and not from the length of the array in order to
			// prevent problem in case some video are deleted from the playlist
			infos['id'] = (this.playlist.length == 0 ? 1 : (this.playlist[this.playlist.length-1]['id']+1));

			this.playlist.push(infos);
		}
	}

	delete(id_video)
	{
		var id = -1;
		// Deleting the video from the playlist
		for(var i = 0; i < this.playlist.length; i++)
		{
			if(this.playlist[i]['id'] == id_video)
			{
				id = i;
				break;
			}
		}

		if(id != -1)
		{
			this.playlist.splice(id, 1);
		}

		// If the current video is after the deleted one, we remove 1 to the id
		if(id < this.id_playlist)
		{
			this.id_playlist = this.id_playlist-1;
		}

		// Check and deleting from the array of video already played if on shuffle
		if(this.shuffle_already_play.length != 0)
		{
			var id_s = -1;
			for(var i = 0; i < this.shuffle_already_play.length; i++)
			{
				if(this.shuffle_already_play[i] == id_video)
				{
					id_s = i;
					break;
				}
			}

			if(id_s != -1)
			{
				this.shuffle_already_play.splice(id_s, 1);
			}
		}
	}

	loadPlaylistYt(url)
	{
		this.player.loadPlaylist(url);
	}

	cuePlaylistYt(url)
	{
		this.player.cuePlaylist(url);
	}

	play()
	{
		this.player.playVideo();
	}

	pause()
	{
		this.is_pause = !this.is_pause;
		this.player.pauseVideo();
	}

	isPause()
	{
		return this.is_pause;
	}

	stop()
	{
		this.player.stopVideo();
	}

	mute()
	{
		if(this.player.isMuted())
		{
			this.player.unMute();
		}
		else
		{
			this.player.mute();
		}
	}

	isMute()
	{
		return this.player.isMuted();
	}

	setVolume(percent)
	{
		this.player.setVolume(percent);
	}

	getVolume()
	{
		return this.player.getVolume();
	}

	getSpeed()
	{
		return this.player.getPlaybackRate();
	}

	setSpeed(speed)
	{
		if(this.player.getAvailablePlaybackRates().includes(speed))
		{
			this.player.setPlaybackRate(speed);
		}
	}

	getSpeedAvailable()
	{
		return this.player.getAvailablePlaybackRates();
	}

	changeLoop()
	{
		this.loop = !this.loop;
	}

	changeShuffle()
	{
		this.shuffle = !this.shuffle;
		if(shuffle)
		{
			// reseting the list of video already played
			this.shuffle_already_play = [];
		}
	}

	getState()
	{
		return this.player.getPlayerState();
	}

	getCurrentTime()
	{
		return this.player.getCurrentTime();
	}

	getTotalTime()
	{
		return this.player.getDuration();
	}

	seekTo(sec)
	{
		this.player.seekTo(sec, true);
	}

	getUrl()
	{
		return this.player.getVideoUrl();
	}

	getPlaylist()
	{
		return this.playlist;
	}

	getPositionPlaylist()
	{
		return this.id_playlist;
	}

	setPlaylist(playlist)
	{
		this.playlist = playlist;
	}

	setPositionPlaylist(position)
	{
		this.id_playlist = position;
	}

	next()
	{
		if(this.playlist.length != 0)
		{
			if(this.loop)
			{
				this.id_playlist = this.id_playlist;
			}
			else if(this.shuffle)
			{
				if(this.shuffle_already_play.length >= this.playlist.length)
				{
					// If all video have been played, we restart the shuffle
					this.shuffle_already_play = [];
				}

				var id_r = (Math.floor(Math.random() * this.playlist.length));

				// Preventing from choosing the same video
				while(this.shuffle_already_play.includes(this.playlist[id_r]['id']))
				{
					id_r = (Math.floor(Math.random() * this.playlist.length));
				}

				this.shuffle_already_play.push(this.playlist[id_r]['id']);

				this.id_playlist = id_r;
				
			}
			else
			{
				if(this.playlist.length > this.id_playlist+1)
				{
					this.id_playlist++;
				}
				else
				{
					this.id_playlist = 0;
				}
			}

			var id = this.id_playlist;
			this.load(this.playlist[id]['video_id']);
		}
		else if(this.loop)
		{
			var infos = this.getCurrentInfos();
			this.load(infos['video_id']);
		}
	}

	previous()
	{
		this.id_playlist--;
		this.load(this.player[this.id_playlist]['video_id']);
	}

	playIndex(id_video)
	{
		var id = -1;
		for(var i = 0; i < this.playlist.length; i++)
		{
			if(this.playlist[i]['id'] == id_video)
			{
				id = i;
				break;
			}
		}

		if(id != -1)
		{
			this.id_playlist = id;
			this.load(this.playlist[this.id_playlist]['video_id']);
		}
	}

	getCurrentInfos()
	{
		return this.player.getVideoData();
	}

	getInfos(url)
	{
		if(url.includes("youtube"))
		{
			var url_arr = url.split('v=');
			url = url_arr[1];
		}

		var infos = [];
		$.getJSON('https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v='+url+'&format=json', function(data) {
			infos = data;
		});

		return infos
	}
}