package com.ratingrocker.httpwww.ratingrockerapp;
// TutorialApp
// Created by Spotify on 25/02/14.
// Copyright (c) 2014 Spotify. All rights reserved.


        import android.app.Activity;
        import android.content.BroadcastReceiver;
        import android.content.Context;
        import android.content.Intent;
        import android.content.IntentFilter;
        import android.graphics.Bitmap;
        import android.graphics.Canvas;
        import android.net.ConnectivityManager;
        import android.os.Bundle;
        //import android.os.Parcel;
        import android.util.Log;
        //import android.text.TextUtils;

        import android.view.View;
        import android.widget.EditText;
        import android.widget.ExpandableListView;
        import android.widget.ImageView;
        import android.widget.ScrollView;
        import android.widget.TextView;
        import android.widget.SeekBar;

        import android.widget.Button;
        import android.widget.Toast;

        //import android.widget.EditText;
        //import android.widget.ImageView;
        //import android.widget.ScrollView;
        //import android.widget.Toast;
        import com.spotify.sdk.android.authentication.AuthenticationClient;
        import com.spotify.sdk.android.authentication.AuthenticationRequest;
        import com.spotify.sdk.android.authentication.AuthenticationResponse;
        import com.spotify.sdk.android.player.Config;
        import com.spotify.sdk.android.player.ConnectionStateCallback;
        import com.spotify.sdk.android.player.Connectivity;
        import com.spotify.sdk.android.player.Error;
        import com.spotify.sdk.android.player.Metadata;
        import com.spotify.sdk.android.player.Player;
        import com.spotify.sdk.android.player.PlaybackState;
        import com.spotify.sdk.android.player.PlayerEvent;
        import com.spotify.sdk.android.player.Spotify;
        import com.spotify.sdk.android.player.SpotifyPlayer;
        import com.squareup.picasso.Picasso;
        import com.squareup.picasso.Transformation;
        import java.util.ArrayList;
        import java.util.HashMap;
        import java.util.List;


public class MainActivity extends Activity implements
         SpotifyPlayer.NotificationCallback, ConnectionStateCallback {

    // TODO: Replace with your client ID
    private static final String CLIENT_ID = "d570917696114c588cc8e1b302d801ed";
    // TODO: Replace with your redirect URI
    private static final String REDIRECT_URI = "rating-rocker-login://callback";
    @SuppressWarnings("SpellCheckingInspection")
    private static final String TEST_SONG_URI = "spotify:track:6KywfgRqvgvfJc3JRwaZdZ";
    @SuppressWarnings("SpellCheckingInspection")
    private static final String TEST_SONG_MONO_URI = "spotify:track:1FqY3uJypma5wkYw66QOUi";
    @SuppressWarnings("SpellCheckingInspection")
    private static final String TEST_SONG_48kHz_URI = "spotify:track:3wxTNS3aqb9RbBLZgJdZgH";
    @SuppressWarnings("SpellCheckingInspection")
    private static final String TEST_PLAYLIST_URI = "spotify:user:spotify:playlist:2yLXxKhhziG2xzy7eyD4TD";
    @SuppressWarnings("SpellCheckingInspection")
    private static final String TEST_ALBUM_URI = "spotify:album:2lYmxilk8cXJlxxXmns1IU";
    @SuppressWarnings("SpellCheckingInspection")
    private static final String TEST_QUEUE_SONG_URI = "spotify:track:5EEOjaJyWvfMglmEwf9bG3";


    // Request code that will be used to verify if the result comes from correct activity
    // Can be any integer
    private static final int REQUEST_CODE = 1337;

    private SpotifyPlayer mPlayer;
    private TextView mMetadataText;
    private PlaybackState mCurrentPlaybackState;
    private BroadcastReceiver mNetworkStateReceiver;
    private static final String TAG = "Mymessages";
    private Metadata mMetadata;
    //private TextView mStatusText;
    //private EditText mSeekEditText;
    //private ScrollView mStatusTextScrollView;
    private static final int[] REQUIRES_INITIALIZED_STATE = {
            R.id.play_track_button,
            //R.id.play_mono_track_button,
            //R.id.play_48khz_track_button,
           R.id.play_album_button,
           R.id.play_playlist_button,
            R.id.pause_button,
           // R.id.seek_button,
           // R.id.low_bitrate_button,
           // R.id.normal_bitrate_button,
           // R.id.high_bitrate_button,
           // R.id.seek_edittext,
    };
    private static final int[] REQUIRES_PLAYING_STATE = {
            R.id.skip_next_button,
            R.id.skip_prev_button,
            R.id.queue_track_button,
            R.id.toggle_shuffle_button,
            R.id.savebutton
           // R.id.toggle_repeat_button,

    };
    private final Player.OperationCallback mOperationCallback = new Player.OperationCallback() {
        @Override
        public void onSuccess() {
            Log.i(TAG, "OK!");
        }

        @Override
        public void onError(Error error) {
            Log.i(TAG,"ERROR:" + error);
        }


    };


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        //mStatusText = (TextView) findViewById(R.id.status_text);
        mMetadataText = (TextView) findViewById(R.id.metadata);
        //mSeekEditText = (EditText) findViewById(R.id.seek_edittext);
        //mStatusTextScrollView = (ScrollView) findViewById(R.id.status_text_container);

        updateView();
        AuthenticationRequest.Builder builder = new AuthenticationRequest.Builder(CLIENT_ID,
                AuthenticationResponse.Type.TOKEN,
                REDIRECT_URI);
        builder.setScopes(new String[]{"user-read-private", "streaming"});
        AuthenticationRequest request = builder.build();

        AuthenticationClient.openLoginActivity(this, REQUEST_CODE, request);

    }
    @Override
    protected void onResume() {
        super.onResume();

        // Set up the broadcast receiver for network events. Note that we also unregister
        // this receiver again in onPause().
        mNetworkStateReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (mPlayer != null) {
                    Connectivity connectivity = getNetworkConnectivity(getBaseContext());

                    mPlayer.setConnectivityStatus(mOperationCallback, connectivity);
                }
            }
        };

        IntentFilter filter = new IntentFilter(ConnectivityManager.CONNECTIVITY_ACTION);
        registerReceiver(mNetworkStateReceiver, filter);

        if (mPlayer != null) {
            mPlayer.addNotificationCallback(MainActivity.this);
            mPlayer.addConnectionStateCallback(MainActivity.this);
        }
    }


    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);

        // Check if result comes from the correct activity
        if (requestCode == REQUEST_CODE) {
            AuthenticationResponse response = AuthenticationClient.getResponse(resultCode, intent);
            if (response.getType() == AuthenticationResponse.Type.TOKEN) {
                Config playerConfig = new Config(this, response.getAccessToken(), CLIENT_ID);
                Spotify.getPlayer(playerConfig, this, new SpotifyPlayer.InitializationObserver() {
                    @Override
                    public void onInitialized(SpotifyPlayer spotifyPlayer) {
                        mPlayer = spotifyPlayer;
                        mPlayer.addConnectionStateCallback(MainActivity.this);
                        mPlayer.addNotificationCallback(MainActivity.this);
                        updateView();
                        /*Button songbutton = (Button) findViewById(R.id.songbutton);
                        songbutton.setOnClickListener(
                                new Button.OnClickListener() {
                                    public void onClick(View v) {

                                        mMetadata = mPlayer.getMetadata();
                                        if (mMetadata != null && mMetadata.currentTrack != null) {
                                            mMetadataText.setText(mMetadata.contextName + "\n" + mMetadata.currentTrack.name + " - " + mMetadata.currentTrack.artistName);

                                        } else {
                                            mMetadataText.setText("<nothing is playing>");
                                        }
                                    }
                                });
                            */
                        /*Button savebutton = (Button) findViewById(R.id.savebutton);
                        savebutton.setOnClickListener(
                                new Button.OnClickListener() {
                                    public void onClick(View v) {

                                        SeekBar partyseek = (SeekBar) findViewById(R.id.partyseekBar);
                                        TextView partyView = (TextView) findViewById(R.id.PartyvibevalText);
                                        String partybarvalue = String.valueOf(partyseek.getProgress());
                                        partyView.setText(partybarvalue);
                                        SeekBar chillseek = (SeekBar) findViewById(R.id.chillseekBar);
                                        TextView chillView = (TextView) findViewById(R.id.chillvibevalText);
                                        String chillbarvalue = String.valueOf(chillseek.getProgress());
                                        chillView.setText(chillbarvalue);
                                        SeekBar studyseek = (SeekBar) findViewById(R.id.studyseekBar);
                                        TextView studyView = (TextView) findViewById(R.id.studyvibevalText);
                                        String studybarvalue = String.valueOf(studyseek.getProgress());
                                        studyView.setText(studybarvalue);
                                        SeekBar freshseek = (SeekBar) findViewById(R.id.freshseekBar);
                                        TextView freshView = (TextView) findViewById(R.id.freshnessvalText);
                                        String freshbarvalue = String.valueOf(freshseek.getProgress());
                                        freshView.setText(freshbarvalue);
                                    }

                                });
                                */
                    }

                    @Override
                    public void onError(Throwable throwable) {
                        Log.e("MainActivity", "Could not initialize player: " + throwable.getMessage());
                    }
                });
            }
        }
    }
    private void updateView() {
        //boolean loggedIn = true;

        // Login button should be the inverse of the logged in state
        //Button loginButton = (Button) findViewById(R.id.login_button);
        //loginButton.setText(loggedIn ? R.string.logout_button_label : R.string.login_button_label);

        // Set enabled for all widgets which depend on initialized state
        for (int id : REQUIRES_INITIALIZED_STATE) {
            findViewById(id).setEnabled(true);
        }

        // Same goes for the playing state
        boolean playing = mCurrentPlaybackState != null && mCurrentPlaybackState.isPlaying;
        for (int id : REQUIRES_PLAYING_STATE) {
            findViewById(id).setEnabled(playing);
        }

        if (mMetadata != null) {
            findViewById(R.id.skip_next_button).setEnabled(mMetadata.nextTrack != null);
            findViewById(R.id.skip_prev_button).setEnabled(mMetadata.prevTrack != null);
            findViewById(R.id.pause_button).setEnabled(mMetadata.currentTrack != null);
        }

        //final ImageView coverArtView = (ImageView) findViewById(R.id.cover_art);
        if (mMetadata != null && mMetadata.currentTrack != null) {
            //final String durationStr = String.format(" (%dms)", mMetadata.currentTrack.durationMs);
            mMetadataText.setText(mMetadata.contextName + "\n" + mMetadata.currentTrack.name + " - " + mMetadata.currentTrack.artistName);

            /*Picasso.with(this)
                    .load(mMetadata.currentTrack.albumCoverWebUrl)
                    .transform(new Transformation() {
                        @Override
                        public Bitmap transform(Bitmap source) {
                            // really ugly darkening trick
                            final Bitmap copy = source.copy(source.getConfig(), true);
                            source.recycle();
                            final Canvas canvas = new Canvas(copy);
                            canvas.drawColor(0xbb000000);
                            return copy;
                        }

                        @Override
                        public String key() {
                            return "darken";
                        }
                    })
                    .into(coverArtView);
                    */
        } else {
            mMetadataText.setText("<nothing is playing>");
            //coverArtView.setBackground(null);
        }

    }

    /* Commands for playback */



    public void onPlayButtonClicked(View view) {

        String uri;
        switch (view.getId()) {
            case R.id.play_track_button:
                uri = TEST_SONG_URI;
                break;

            case R.id.play_playlist_button:
                uri = TEST_PLAYLIST_URI;
                break;
            case R.id.play_album_button:
                uri = TEST_ALBUM_URI;
                break;
            default:
                throw new IllegalArgumentException("View ID does not have an associated URI to play");
        }


        mPlayer.playUri(mOperationCallback, uri, 0, 0);
    }

    public void onPauseButtonClicked(View view) {
        if (mCurrentPlaybackState != null && mCurrentPlaybackState.isPlaying) {
            mPlayer.pause(mOperationCallback);
        } else {
            mPlayer.resume(mOperationCallback);
        }
    }

    public void onSkipToPreviousButtonClicked(View view) {
        mPlayer.skipToPrevious(mOperationCallback);
    }

    public void onSkipToNextButtonClicked(View view) {
        mPlayer.skipToNext(mOperationCallback);
    }

    public void onQueueSongButtonClicked(View view) {
        mPlayer.queue(mOperationCallback, TEST_QUEUE_SONG_URI);

    }

    public void onToggleShuffleButtonClicked(View view) {
        mPlayer.setShuffle(mOperationCallback, !mCurrentPlaybackState.isShuffling);
    }

    public void onToggleRepeatButtonClicked(View view) {
        mPlayer.setRepeat(mOperationCallback, !mCurrentPlaybackState.isRepeating);
    }
    public void onSaveButtonClicked(View view) {
        SeekBar partyseek = (SeekBar) findViewById(R.id.partyseekBar);
        TextView partyView = (TextView) findViewById(R.id.PartyvibevalText);
        String partybarvalue = String.valueOf(partyseek.getProgress());
        partyView.setText(partybarvalue);
        SeekBar chillseek = (SeekBar) findViewById(R.id.chillseekBar);
        TextView chillView = (TextView) findViewById(R.id.chillvibevalText);
        String chillbarvalue = String.valueOf(chillseek.getProgress());
        chillView.setText(chillbarvalue);
        SeekBar studyseek = (SeekBar) findViewById(R.id.studyseekBar);
        TextView studyView = (TextView) findViewById(R.id.studyvibevalText);
        String studybarvalue = String.valueOf(studyseek.getProgress());
        studyView.setText(studybarvalue);
        SeekBar freshseek = (SeekBar) findViewById(R.id.freshseekBar);
        TextView freshView = (TextView) findViewById(R.id.freshnessvalText);
        String freshbarvalue = String.valueOf(freshseek.getProgress());
        freshView.setText(freshbarvalue);
    }
    /*public void onSeekButtonClicked(View view) {
        final Integer seek = Integer.valueOf(mSeekEditText.getText().toString());
        mPlayer.seekToPosition(mOperationCallback, seek);
    }*/
    @Override
    protected void onDestroy() {
        // VERY IMPORTANT! This must always be called or else you will leak resources
        Spotify.destroyPlayer(this);
        super.onDestroy();
    }

    @Override
    public void onPlaybackEvent(PlayerEvent playerEvent) {
        Log.d("MainActivity", "Playback event received: " + playerEvent.name());
        switch (playerEvent) {

            case kSpPlaybackNotifyPlay:
                break;
            case kSpPlaybackNotifyPause:
                break;
            case kSpPlaybackNotifyTrackChanged:
                mCurrentPlaybackState = mPlayer.getPlaybackState();
                mMetadata = mPlayer.getMetadata();
                Log.i(TAG, "Player state: " + mCurrentPlaybackState);
                Log.i(TAG, "Metadata: " + mMetadata);
                updateView();
                break;
            /*
            case kSpPlaybackNotifyNext:
                break;
            case kSpPlaybackNotifyPrev:
                break;
            case kSpPlaybackNotifyShuffleOn:
                break;
            case kSpPlaybackNotifyShuffleOff:
                break;
            case kSpPlaybackNotifyRepeatOn:
                break;
            case kSpPlaybackNotifyRepeatOff:
                break;
            case kSpPlaybackNotifyBecameActive:
                break;
            case kSpPlaybackNotifyBecameInactive:
                break;
            case kSpPlaybackNotifyLostPermission:
                break;
            case kSpPlaybackEventAudioFlush:
                break;
            case kSpPlaybackNotifyAudioDeliveryDone:
                break;
            case kSpPlaybackNotifyContextChanged:
                break;
            case kSpPlaybackNotifyTrackDelivered:
                break;
            case kSpPlaybackNotifyMetadataChanged:

                break;
                */

            default:

                break;
        }
        updateView();
    }

    @Override
    public void onPlaybackError(Error error) {
        Log.d("MainActivity", "Playback error received: " + error.name());
        switch (error) {
            // Handle error type as necessary
            default:
                break;
        }
    }

    @Override
    public void onLoggedIn() {
        Log.d("MainActivity", "User logged in");
        mPlayer.playUri(null, "spotify:user:spotify:playlist:37i9dQZF1E9G8oeYG9uL66", 0, 0);
        // mPlayer.playUri(null, "spotify:track:2TpxZ7JUBn3uw46aR7qd6V", 0, 0);
    }

    @Override
    public void onLoginFailed(Error error) {
        Log.d("MainActivity", "Login failed");
    }

    @Override
    public void onLoggedOut() {
        Log.d("MainActivity", "User logged out");
    }


    @Override
    public void onTemporaryError() {
        Log.d("MainActivity", "Temporary error occurred");
    }

    @Override
    public void onConnectionMessage(String message) {
        Log.d("MainActivity", "Received connection message: " + message);
    }



}

