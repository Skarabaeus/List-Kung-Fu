class ListsController < ApplicationController

	before_filter :authenticate_user!

  respond_to :xml

  def index
    @lists = current_user.lists.order( "created_at desc" )
    respond_with(@lists)
  end

  def show
    @list = current_user.lists.find( params[:id] )
    respond_with(@list)
  end

  def new
    @list = List.new

    respond_with( @list ) do |format|
      format.js
    end
  end

  def edit
    @list = current_user.lists.find( params[:id] )

    respond_with( @list ) do |format|
      format.js
    end
  end

  def create
    @list = List.new(params[:list])
    @list.owner = current_user

    if @list.save
      flash[:notice] = 'List has been created.'
    end

    respond_with( @list )
  end

  def update
    flash_notice = 'List title has been updated.'

    @list = current_user.lists.find( params[:id] )

    @list.title = params[ :list ][ :title ]

    tag_id = params[ :list ][ :tag_id ]
    tag_action = params[ :list ][ :tag_action ] || 'add'

    unless tag_id.nil?
      if tag_action == 'remove'
        tag_ids = @list.tag_ids
        tag_ids.delete( tag_id.to_i )
        @list.tag_ids = tag_ids
        flash_notice = 'Tag has been removed from list.'
      else
        # no worries about dublicates, rails takes care of that.
        @list.tag_ids = @list.tag_ids + [ tag_id ]
        flash_notice = 'Tag has been added to list.'
      end
    end

    if @list.save
      flash[:notice] = flash_notice
    end

    respond_with( @list )
  end

  def destroy
    @list = current_user.lists.find( params[:id] )
    @list.destroy

    respond_with( @list )
  end
end
