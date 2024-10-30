package com.stream.app.services.impl;

import com.stream.app.entities.Video;
import com.stream.app.repository.VideoRepository;
import com.stream.app.services.VideoService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
public class VideoServiceImpl implements VideoService {

    @Value("${files.video}")
    String DIR;

    @Value("${file.video.hls}")
    String HLS_DIR;


    private VideoRepository videoRepository;

    public VideoServiceImpl(VideoRepository videoRepository) {
        this.videoRepository = videoRepository;
    }

    @PostConstruct
    public void init()
    {
        File file = new File(DIR);

        try {
            Files.createDirectories(Paths.get(HLS_DIR));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }


        if (!file.exists()) {
            file.mkdir();
            System.out.println("Folder created");
        } else {
            System.out.println("Folder already exists");
        }
    }

    @Override
    public Video save(Video video, MultipartFile file) {

        try {

            String fileName = file.getOriginalFilename();
            String contentType = file.getContentType();
            InputStream inputStream = file.getInputStream();


//            file path

            String cleanFileName = StringUtils.cleanPath(fileName);

//            folder path : create

            String cleanFolder = StringUtils.cleanPath(DIR);

            //        folder path with filename

            Path path = Paths.get(cleanFolder, cleanFileName);

            System.out.println(contentType);
            System.out.println(path);


//        copy file to the folder

            Files.copy(inputStream, path, StandardCopyOption.REPLACE_EXISTING);

//        video meta data

            video.setContentType(contentType);
            video.setFilePath(path.toString());

            videoRepository.save(video);

//          processing video

            processVideo(video.getVideoId());

//            delete actual video file if exception

            //          save meta data

            return video;


        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }


    }

    @Override
    public Video get(String videoId) {

        Video video = videoRepository.findById(videoId).orElseThrow(() -> new RuntimeException("Video not found"));

        return video;
    }

    @Override
    public Video getByTitle(String title) {
        return null;
    }

    @Override
    public List<Video> getAllVideos() {
        return videoRepository.findAll();
    }

    @Override
    public String processVideo(String videoId) {

        Video video = get(videoId);
        String filePath = video.getFilePath();

//        path where to store data

        Path videoPath = Paths.get(filePath);


        try {

//            ffmpeg command

            Path outputPath = Paths.get(HLS_DIR, videoId);

            Files.createDirectories(outputPath);


            String ffmpegCmd = String.format(
                    "ffmpeg -i \"%s\" -c:v libx264 -c:a aac -strict -2 -f hls -hls_time 10 -hls_list_size 0 -hls_segment_filename \"%s/segment_%%3d.ts\"  \"%s/master.m3u8\" ",
                    videoPath, outputPath, outputPath
            );



            System.out.println(ffmpegCmd);
            //file this command
            ProcessBuilder processBuilder = new ProcessBuilder("/bin/bash", "-c", ffmpegCmd);
            processBuilder.inheritIO();
            Process process = processBuilder.start();
            int exit = process.waitFor();
            if (exit != 0) {
                throw new RuntimeException("video processing failed!!");
            }

            return videoId;


        } catch (IOException ex) {
            throw new RuntimeException("Video processing fail!!");
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

}
