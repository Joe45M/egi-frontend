<?php
/**
 * Plugin Name: MCP Comprehensive Abilities
 * Description: Registers a full suite of read and write abilities for the Model Context Protocol (MCP), including CRUD operations for posts and pages.
 * Version: 2.0.0
 * Author: MCP Integration
 */

add_action( 'wp_abilities_api_init', function() {
    if ( ! function_exists( 'wp_register_ability' ) ) return;

    $public_meta = [ 'mcp' => [ 'public' => true ], 'show_in_rest' => true ];

    // ----- READ ABILITIES -----

    // 1. Get Site Info
    wp_register_ability( 'mcp/get-site-info', [
        'label' => 'Get Site Information',
        'description' => 'Returns core site information (title, tagline, URL, version).',
        'execute_callback' => function() {
            return [
                'name' => get_bloginfo('name'),
                'description' => get_bloginfo('description'),
                'url' => get_bloginfo('url'),
                'wp_version' => get_bloginfo('version'),
            ];
        },
        'meta' => $public_meta
    ]);

    // 2. Get Environment Info
    wp_register_ability( 'mcp/get-environment-info', [
        'label' => 'Get Environment Info',
        'description' => 'Returns PHP, Database, and Environment details.',
        'execute_callback' => function() {
            global $wpdb;
            return [
                'php_version' => PHP_VERSION,
                'db_server' => $wpdb->db_server_info(),
                'environment' => wp_get_environment_type(),
            ];
        },
        'meta' => $public_meta
    ]);

    // 3. Search Posts
    wp_register_ability( 'mcp/search-posts', [
        'label' => 'Search Posts',
        'description' => 'Search for published posts by keyword.',
        'input_schema' => [
            'type' => 'object',
            'properties' => [
                'query' => [ 'type' => 'string', 'description' => 'Search term.' ],
                'post_type' => [ 'type' => 'string', 'description' => 'Post type (e.g., post, page). Defaults to post.', 'default' => 'post' ],
                'limit' => [ 'type' => 'integer', 'description' => 'Number of results. Defaults to 5.', 'default' => 5 ]
            ],
            'required' => [ 'query' ],
        ],
        'execute_callback' => function( $args ) {
            $limit = isset($args['limit']) ? intval($args['limit']) : 5;
            $post_type = isset($args['post_type']) ? sanitize_text_field($args['post_type']) : 'post';
            $query = new WP_Query([ 's' => sanitize_text_field($args['query']), 'post_type' => $post_type, 'posts_per_page' => $limit, 'post_status' => 'publish' ]);
            return array_map( function( $post ) {
                return [ 'id' => $post->ID, 'title' => get_the_title( $post ), 'url' => get_permalink( $post ), 'type' => $post->post_type ];
            }, $query->posts );
        },
        'meta' => $public_meta
    ]);

    // 4. Get Single Post
    wp_register_ability( 'mcp/get-post', [
        'label' => 'Get Single Post',
        'description' => 'Retrieve full details of a specific post by ID.',
        'input_schema' => [
            'type' => 'object',
            'properties' => [ 'post_id' => [ 'type' => 'integer', 'description' => 'The ID of the post/page to retrieve.' ] ],
            'required' => [ 'post_id' ],
        ],
        'execute_callback' => function( $args ) {
            $post = get_post( intval( $args['post_id'] ) );
            if ( ! $post ) return new WP_Error( 'not_found', 'Post not found.' );
            return [
                'id' => $post->ID,
                'title' => get_the_title( $post ),
                'content' => $post->post_content,
                'status' => $post->post_status,
                'type' => $post->post_type,
                'url' => get_permalink( $post )
            ];
        },
        'meta' => $public_meta
    ]);

    // ----- WRITE ABILITIES -----

    // 5. Create Post
    wp_register_ability( 'mcp/create-post', [
        'label' => 'Create Post',
        'description' => 'Create a new WordPress post or page.',
        'input_schema' => [
            'type' => 'object',
            'properties' => [
                'title'   => [ 'type' => 'string', 'description' => 'The title of the post.' ],
                'content' => [ 'type' => 'string', 'description' => 'The HTML content of the post.' ],
                'status'  => [ 'type' => 'string', 'description' => 'Post status (publish, draft, private). Defaults to draft.', 'default' => 'draft', 'enum' => ['publish', 'draft', 'private', 'pending'] ],
                'type'    => [ 'type' => 'string', 'description' => 'Post type (post, page). Defaults to post.', 'default' => 'post' ]
            ],
            'required' => [ 'title', 'content' ],
        ],
        'execute_callback' => function( $args ) {
            if ( ! current_user_can( 'edit_posts' ) ) return new WP_Error( 'rest_forbidden', 'Sorry, you are not allowed to create posts strictly.', ['status' => 403] );

            $post_data = [
                'post_title'   => sanitize_text_field( $args['title'] ),
                'post_content' => wp_kses_post( $args['content'] ),
                'post_status'  => isset($args['status']) ? sanitize_text_field($args['status']) : 'draft',
                'post_type'    => isset($args['type']) ? sanitize_text_field($args['type']) : 'post',
            ];

            $post_id = wp_insert_post( $post_data, true );
            
            if ( is_wp_error( $post_id ) ) return $post_id;

            return [ 'success' => true, 'post_id' => $post_id, 'url' => get_permalink( $post_id ) ];
        },
        'meta' => $public_meta
    ]);

    // 6. Update Post
    wp_register_ability( 'mcp/update-post', [
        'label' => 'Update Post',
        'description' => 'Update an existing WordPress post or page.',
        'input_schema' => [
            'type' => 'object',
            'properties' => [
                'post_id' => [ 'type' => 'integer', 'description' => 'The ID of the post to update.' ],
                'title'   => [ 'type' => 'string', 'description' => 'The new title of the post (optional).' ],
                'content' => [ 'type' => 'string', 'description' => 'The new HTML content of the post (optional).' ],
                'status'  => [ 'type' => 'string', 'description' => 'New post status (optional).', 'enum' => ['publish', 'draft', 'private', 'pending'] ]
            ],
            'required' => [ 'post_id' ],
        ],
        'execute_callback' => function( $args ) {
            if ( ! current_user_can( 'edit_post', $args['post_id'] ) ) return new WP_Error( 'rest_forbidden', 'Sorry, you are not allowed to edit this post.', ['status' => 403] );

            $post_data = [ 'ID' => intval( $args['post_id'] ) ];
            if ( isset( $args['title'] ) ) $post_data['post_title'] = sanitize_text_field( $args['title'] );
            if ( isset( $args['content'] ) ) $post_data['post_content'] = wp_kses_post( $args['content'] );
            if ( isset( $args['status'] ) ) $post_data['post_status'] = sanitize_text_field( $args['status'] );

            $post_id = wp_update_post( $post_data, true );
            
            if ( is_wp_error( $post_id ) ) return $post_id;

            return [ 'success' => true, 'post_id' => $post_id, 'url' => get_permalink( $post_id ) ];
        },
        'meta' => $public_meta
    ]);

    // 7. Delete Post
    wp_register_ability( 'mcp/delete-post', [
        'label' => 'Delete Post',
        'description' => 'Moves a post to the trash, or permanently deletes it.',
        'input_schema' => [
            'type' => 'object',
            'properties' => [
                'post_id' => [ 'type' => 'integer', 'description' => 'The ID of the post to delete.' ],
                'force'   => [ 'type' => 'boolean', 'description' => 'Whether to bypass trash and force deletion. Default false.', 'default' => false ]
            ],
            'required' => [ 'post_id' ],
        ],
        'execute_callback' => function( $args ) {
            if ( ! current_user_can( 'delete_post', $args['post_id'] ) ) return new WP_Error( 'rest_forbidden', 'Sorry, you are not allowed to delete this post.', ['status' => 403] );

            $force = isset( $args['force'] ) ? rest_sanitize_boolean( $args['force'] ) : false;
            $result = wp_delete_post( intval( $args['post_id'] ), $force );

            if ( ! $result ) return new WP_Error( 'delete_failed', 'Failed to delete post.' );

            return [ 'success' => true, 'message' => $force ? 'Post permanently deleted.' : 'Post moved to trash.' ];
        },
        'meta' => $public_meta
    ]);

}, 100 );
